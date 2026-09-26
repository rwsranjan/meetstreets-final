import "@/styles/globals.css";
import Layout from "@/components/layout/Layout";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App({ Component, pageProps }) {
  return (
    <GoogleOAuthProvider clientId="738802341314-ml01k5k8klqg6l6hmk322oaihnennn05.apps.googleusercontent.com">
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GoogleOAuthProvider>
  );
}
