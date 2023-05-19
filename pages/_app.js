import "@/styles/globals.css"
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Head from "next/head"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import { NotificationProvider } from "web3uikit"

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: "https://api.studio.thegraph.com/query/46871/marketplace/v0.0.1",
})

export default function App({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <title>NFT MarketPlace</title>
                <meta name="description" content="NFT Marketplace"></meta>
                <link rel="icon" href="/favicon.ico"></link>
            </Head>

            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Header />
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </div>
    )
}
