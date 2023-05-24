import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import nftMarketPlaceAbi from "../constants/NftMarketplace.json"
import raccoonsAbi from "../constants/Raccoons.json"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import ListingUpdate from "./ListingUpdate"

function checkSeller(seller) {
    return seller.substring(0, 5) + "..." + seller.substring(seller.length - 5)
}

export default function NFTBox({
    price,
    nftAddress,
    tokenId,
    nftMarketPlaceAddress,
    seller,
}) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showListing, setShowListing] = useState(false)
    const hideListing = function () {
        setShowListing(false)
    }
    const dispatch = useNotification()

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: raccoonsAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketPlaceAbi,
        contractAddress: nftMarketPlaceAddress,
        functionName: "itemBuy",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenID: tokenId,
        },
    })

    async function updateUI() {
        const tokenURI = await getTokenURI()

        if (tokenURI) {
            const reqURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(reqURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
            )
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
        }
    }

    async function buySuccess() {
        dispatch({
            type: "success",
            message: "You bought the NFT",
            title: "Item Bougth!",
            position: "topR",
        })
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = seller === account || seller === undefined

    const sellerAddress = isOwnedByUser ? "you" : checkSeller(seller)

    function changeListing() {
        if (isOwnedByUser) {
            setShowListing(true)
        } else {
            buyItem({
                onError: (error) => {
                    console.log(error)
                },
                onSuccess: buySuccess,
            })
        }
    }

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <ListingUpdate
                            isVisible={showListing}
                            tokenId={tokenId}
                            nftAddress={nftAddress}
                            marketplaceAddress={nftMarketPlaceAddress}
                            onClose={hideListing}
                        />
                        <div className="my-4 ml-8">
                            <Card
                                onClick={changeListing}
                                title={tokenName}
                                description={tokenDescription}
                            >
                                <div className="p-2">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="italic text-sm">
                                            Owned by {sellerAddress}
                                        </div>
                                        <Image
                                            loader={() => imageURI}
                                            src={imageURI}
                                            height="200"
                                            width="200"
                                        />
                                        <div className="font-bold text-right text-black">
                                            <p>
                                                {ethers.utils.formatUnits(
                                                    price,
                                                    "ether"
                                                )}{" "}
                                                ETH
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}
