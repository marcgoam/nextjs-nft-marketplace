import { useMoralis } from "react-moralis"
import { networkMapping, marketplaceAbi } from "../constants"
import { useQuery } from "@apollo/client"
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries"
import NFTBox from "@/components/NFTBox"

export default function Home() {
    const { isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const marketPlaceAddress =
        chainId in networkMapping ? networkMapping[chainId][0] : null

    const { loading, error, data: listedNFTs } = useQuery(GET_ACTIVE_ITEMS)
    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>

            <div className="flex flex-wrap">
                {isWeb3Enabled && chainId ? (
                    loading || !listedNFTs ? (
                        <div>Loading...</div>
                    ) : (
                        listedNFTs.activeItems.map((nft) => {
                            const { price, nftAddress, tokenId, seller } = nft
                            return marketPlaceAddress ? (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    nftMarketPlaceAddress={marketPlaceAddress}
                                    seller={seller}
                                    key={`${nftAddress}${tokenId}`}
                                />
                            ) : (
                                <div>
                                    Network error, please switch to a supported
                                    network.{" "}
                                </div>
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
