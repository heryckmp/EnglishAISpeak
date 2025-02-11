import { auth } from "./auth";

export default auth;

export const config = {
  // Definir quais rotas requerem autenticação
  matcher: [
    "/chat/:path*",
    "/write/:path*",
    "/practice/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
}; 