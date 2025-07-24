import axios from 'axios';
import {env} from "../lib/env.ts";

const apiClient = axios.create({
    baseURL: env.ROB_API_URL,
});

export default apiClient;
