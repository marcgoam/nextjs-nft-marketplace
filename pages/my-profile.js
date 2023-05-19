import { Button, Card, Link } from "web3uikit"
import Image from "next/image"
const { ethers } = require("ethers")
import { Network, Alchemy } from "alchemy-sdk"
import { useEffect, useState } from "react"
import { useMoralis } from "react-moralis"
import { useRouter } from "next/router"

export default function Home() {
    const account = useMoralis()
    const router = useRouter()
    const [nftsList, setNFTList] = useState([])
    const [imageURIs, setImageURIs] = useState([])

    const settings = {
        apiKey: process.env.ALCHEMY_APY_KEY,
        network: Network.ETH_GOERLI,
    }

    const alchemy = new Alchemy(settings)

    const handleList = (contractAddress, tokenId) => {
        router.push({
            pathname: "/sell-nft",
            query: { address: contractAddress, id: tokenId },
        })
    }

    useEffect(() => {
        async function nfts() {
            try {
                const listNfts = []
                const contractAddress = [
                    "0x462be688586f5543ca74a3a887f3f916204a61fe",
                ]

                const res = await alchemy.nft.getNftsForOwner(account.account)

                for (let i = 0; i < res.ownedNfts.length; i++) {
                    if (
                        contractAddress.includes(
                            res.ownedNfts[i].contract.address
                        )
                    ) {
                        console.log(res.ownedNfts[i].contract.address)
                        listNfts.push(res.ownedNfts[i])
                    }
                }

                setNFTList(listNfts)
            } catch (error) {
                console.error(error)
                setNFTList([]) // Return an empty array or handle the error accordingly
            }
        }

        nfts()
        console.log(nftsList)
    }, [])

    useEffect(() => {
        async function fetchImageURIs() {
            const uris = await Promise.all(
                nftsList.map((nft) => checkURI(nft.tokenUri.raw))
            )
            setImageURIs(uris)
        }

        fetchImageURIs()
    }, [nftsList])

    async function checkURI(uri) {
        if (uri) {
            const reqURL = uri.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await fetch(reqURL)
            const tokenURI = await tokenURIResponse.json()
            const imageURIURL = tokenURI.image.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
            )

            return imageURIURL.toString()
        }
    }

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">My NFT Gallery</h1>
            <div className="flex flex-wrap">
                {nftsList.map((nft, index) => (
                    <div key={nft.id}>
                        <div className="my-4 ml-8">
                            <Card>
                                <div className="p-2">
                                    <div className="flex flex-col items-center gap-2">
                                        {imageURIs[index] && (
                                            <Image
                                                src={imageURIs[index]}
                                                alt={nft.name}
                                                width="200"
                                                height="200"
                                            />
                                        )}
                                        <div className="font-bold text-black">
                                            {nft.title}
                                        </div>

                                        <div>{nft.description}</div>
                                        <Button
                                            text="List NFT"
                                            theme="primary"
                                            onClick={() =>
                                                handleList(
                                                    nft.contract.address,
                                                    nft.tokenId
                                                )
                                            }
                                        ></Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
