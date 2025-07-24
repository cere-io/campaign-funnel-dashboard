import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  EmbedWallet,
  type PermissionRequest,
  type UserInfo,
  type WalletInitOptions,
} from "@cere/embed-wallet";
import apiClient from "../services/apiClient.ts";
import { env } from "../lib/env.ts";

const APP_ID = "campaign-configurator";
const APP_NAME = "Campaign Configurator";
const APP_EMAIL = "team@cere.io";

const WALLET_PERMISSIONS: PermissionRequest = {
  ed25519_signRaw: {
    title: "Sign API request",
    description: "Allow the app to send API request on your behalf.",
  },
};

const WALLET_INIT_OPTIONS: WalletInitOptions = {
  appId: APP_ID,
  popupMode: "modal",
  context: {
    app: {
      name: APP_NAME,
      email: APP_EMAIL,
      url: window.origin,
      logoUrl: `${window.origin}/favicon.png`,
    },
  },
  mode: "light",
  connectOptions: {
    permissions: WALLET_PERMISSIONS,
  },
};

type AuthMethod = "wallet" | "php_session" | null;
type WalletStatus =
  | "uninitialized"
  | "initializing"
  | "connected"
  | "disconnected"
  | "error";

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
  userInfo: UserInfo | null;
  token?: string;
  sessionId: string | null;
  authMethod: AuthMethod;
  walletStatus: WalletStatus;
  wallet: EmbedWallet;
  initAuth: () => Promise<boolean>;
  connect: (params: { email?: string }) => Promise<{ isNewUser: boolean }>;
  disconnect: () => Promise<void>;
  refreshToken: () => Promise<string | undefined>;
}

// JWT-like wallet token interface
interface WalletToken {
  header: {
    alg: string;
    typ: string;
  };
  payload: {
    email: string;
    publicKey: string;
    exp: number;
    iat: number;
  };
  signature: string;
}

// Token expiration time (15 minutes)
const TOKEN_EXPIRATION_MS = 15 * 60 * 1000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [wallet] = useState(
    () => new EmbedWallet({ appId: APP_ID, env: env.ENVIRONMENT }),
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | undefined>();
  const [walletStatus, setWalletStatus] =
    useState<WalletStatus>("uninitialized");
  const [tokenExpiration, setTokenExpiration] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      if (isInitialized) {
        // Skip if already initialized
        return;
      }

      console.log("Initializing authentication...");
      setWalletStatus("initializing");

      try {
        // Initialize auth through the store
        await initAuth();
        console.log("Auth initialization completed successfully");
      } catch (error) {
        console.error("Auth initialization error:", error);
        setWalletStatus("error");
        setError("Failed to initialize authentication");
      } finally {
        setIsInitialized(true);
        console.log("Auth state:", {
          initialized: true,
        });
      }
    };

    init();
    // Run only once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!isAuthenticated || authMethod !== "wallet" || !tokenExpiration) {
      return;
    }

    // Calculate when to refresh (5 minutes before expiry)
    const refreshTime = tokenExpiration - Date.now() - 5 * 60 * 1000;
    const timeUntilRefresh = Math.max(refreshTime, 1000); // Ensure positive timeout

    const refreshTimerId = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);

    return () => clearTimeout(refreshTimerId);
  }, [isAuthenticated, authMethod, tokenExpiration]);

  const handleSessionAuthentication = useCallback(
    async (sid: string): Promise<boolean> => {
      try {
        setIsAuthenticating(true);
        setSessionId(sid);
        const response = await apiClient.get("/auth/login", {
          headers: { Authorization: `Session ${sid}` },
        });
        const userData = response.data.data || response.data;
        const user: UserInfo = {
          email: userData.email || "session-user@example.com",
          name: userData.username || userData.name || "Session User",
          profileImage: "",
          isNewUser: false,
          isNewWallet: false,
        };
        setUserInfo(user);
        setIsAuthenticated(true);
        setAuthMethod("php_session");
        return true;
      } catch (err: any) {
        setError(err.message);
        setSessionId(null);
        return false;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [],
  );

  const generateWalletToken = async (user: UserInfo) => {
    try {
      const signer = wallet.getSigner({ type: "ed25519" });
      const account = await signer.getAccount();
      const publicKey = account.publicKey;

      if (!publicKey) {
        throw new Error("Failed to get public key from wallet");
      }

      const now = Date.now();
      const expirationTime = now + TOKEN_EXPIRATION_MS;

      const tokenData: WalletToken = {
        header: {
          alg: "ed25519",
          typ: "JWT",
        },
        payload: {
          email: user.email,
          publicKey: publicKey,
          iat: now,
          exp: expirationTime,
        },
        signature: "", // Will be filled after signing
      };

      // Create the string to sign (base64 encoded header and payload)
      const headerStr = btoa(JSON.stringify(tokenData.header));
      const payloadStr = btoa(JSON.stringify(tokenData.payload));
      const dataToSign = `${headerStr}.${payloadStr}`;

      // Sign the data
      const signature = await signer.signMessage(dataToSign);

      // Create the complete token
      const token = `${dataToSign}.${signature}`;

      // Set token expiration for refresh logic
      setTokenExpiration(expirationTime);

      console.log("Generated wallet token:", {
        token,
        expiration: tokenData.payload.exp,
      });

      return token;
    } catch (error) {
      console.error("Failed to generate wallet token:", error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<string | undefined> => {
    if (!isAuthenticated || authMethod !== "wallet" || !userInfo) {
      return undefined;
    }

    try {
      const newToken = await generateWalletToken(userInfo);
      if (newToken) {
        setToken(newToken);
        return newToken;
      }
      return undefined;
    } catch (error) {
      console.error("Token refresh failed", error);
      return undefined;
    }
  };

  const handleWalletAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      setWalletStatus("initializing");
      await wallet.init(WALLET_INIT_OPTIONS).catch((e) => {
        if (!String(e).includes("Already initialized")) throw e;
      });

      await wallet.isReady;

      const user = await wallet.getUserInfo().catch(() => null);
      if (!user) {
        setWalletStatus("disconnected");
        return false;
      }

      setUserInfo(user);
      setIsAuthenticated(true);
      setAuthMethod("wallet");
      setWalletStatus("connected");

      try {
        const token = await generateWalletToken(user);
        if (token) {
          setToken(token);
        }
      } catch (tokenError) {
        console.error("Wallet token generation failed", tokenError);
        setError("Failed to generate authentication token");
        // Continue with authentication even if token generation fails
      }

      return true;
    } catch (err) {
      console.error("Wallet authentication failed", err);
      setWalletStatus("error");
      setError("Wallet authentication failed");
      return false;
    }
  }, [wallet]);

  const initAuth = useCallback(async (): Promise<boolean> => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.split("?")[1] || "",
      );
      const sid = urlParams.get("sessionId") || hashParams.get("sessionId");

      if (sid) {
        const success = await handleSessionAuthentication(sid);
        if (success) return true;
      }

      return await handleWalletAuthentication();
    } catch (e: any) {
      console.error("initAuth failed", e);
      setError(e.message);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [handleSessionAuthentication, handleWalletAuthentication]);

  const connect = useCallback(
    async ({ email }: { email?: string }): Promise<{ isNewUser: boolean }> => {
      setIsAuthenticating(true);
      setError(null);
      setWalletStatus("initializing");

      try {
        // Ensure wallet is initialized
        await wallet.init(WALLET_INIT_OPTIONS).catch((e) => {
          if (!String(e).includes("Already initialized")) throw e;
        });

        if (email) {
        await wallet.connect({ email });
        } else {
          wallet.connect()
        }
        const user = await wallet.getUserInfo();
        setUserInfo(user);
        setIsAuthenticated(true);
        setAuthMethod("wallet");
        setWalletStatus("connected");

        try {
          const token = await generateWalletToken(user);
          if (token) {
            setToken(token);
          }
        } catch (tokenError) {
          console.error("Wallet token generation failed", tokenError);
          setError("Failed to generate authentication token");
          // Continue with connection even if token generation fails
        }

        return { isNewUser: user.isNewUser };
      } catch (err: any) {
        setError(err.message);
        setWalletStatus("error");
        throw err;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [generateWalletToken, wallet],
  );

  const disconnect = useCallback(async () => {
    try {
      if (authMethod === "wallet") {
        await wallet.disconnect();
      }
      setIsAuthenticated(false);
      setUserInfo(null);
      setAuthMethod(null);
      setToken(undefined);
      setTokenExpiration(null);
      setWalletStatus("disconnected");
      setSessionId(null);
      setError(null);
    } catch (error) {
      console.error("Disconnect failed", error);
      setError("Failed to disconnect from wallet");
    }
  }, [wallet, authMethod]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthenticating,
        error,
        userInfo,
        token,
        sessionId,
        authMethod,
        wallet,
        walletStatus,
        initAuth,
        connect,
        disconnect,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
