export function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex-col gap-4 w-full flex items-center justify-center">
        <div className="w-19 h-19 border-8 text-blue-400 text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-blue-400 rounded-full">
          <svg
            viewBox="0 0 24 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
          >
            <g clipPath="url(#a)">
              <path
                d="M12.77 26.848c-5.95 0-10.572-2.88-12.063-7.515l-.334-1.037.978-.471c.103-.051 2.668-1.35 2.509-3.901-.169-2.695-2.339-3.96-2.431-4.012L.475 9.37l.412-1.025C2.838 3.601 7.28.77 12.77.77c4.314 0 8.095 1.698 10.37 4.658l.575.748-4.535 6.146-1.013-.984c-.02-.019-2.175-2.069-4.678-2.08-2.411-.012-3.362.902-3.401.941L8.3 8.473c.164-.175 1.695-1.733 5.199-1.707 2.232.01 4.161 1.084 5.3 1.896l1.778-2.41c-1.845-1.91-4.636-2.99-7.808-2.99-4.095 0-7.459 1.91-9.182 5.155 1.042.879 2.57 2.62 2.742 5.35.185 2.95-1.692 4.806-2.913 5.692 1.445 3.043 4.932 4.895 9.354 4.895 3.063 0 6.198-1.2 8.134-3.053l-2.023-2.55c-1.077.768-2.917 1.764-5.323 1.89-3.416.177-5.436-1.404-5.52-1.471l1.536-1.954c.047.035 1.42 1.065 3.855.936 2.884-.15 4.734-2.012 4.75-2.032l.98-1.002.874 1.094 4.088 5.155-.627.779c-2.3 2.856-6.508 4.702-10.726 4.702Z"
                fill="currentColor"
              />
            </g>
            <defs>
              <clipPath id="a">
                <path
                  fill="currentColor"
                  transform="translate(.373 .77)"
                  d="M0 0h23.615v26.36H0z"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
