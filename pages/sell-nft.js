import { Inter } from "next/font/google"
import { Form, useNotification } from "web3uikit"
import { ethers } from "ethers"
import { networkMapping, nftAbi, marketplaceAbi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useRouter } from "next/router"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
    const { isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const router = useRouter()
    const { address, id } = router.query
    const chainId = parseInt(chainIdHex)

    const marketPlaceAddress =
        chainId in networkMapping ? networkMapping[chainId][0] : null

    const dispatch = useNotification()

    const { runContractFunction } = useWeb3Contract()

    async function approveAndList(data) {
        console.log("Approving..")

        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils
            .parseUnits(data.data[2].inputResult, "ether")
            .toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketPlaceAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: (tx) => approveSuccess(tx, nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function approveSuccess(tx, nftAddress, tokenId, price) {
        console.log("Listing...")
        await tx.wait()
        const listOptions = {
            abi: marketplaceAbi,
            contractAddress: marketPlaceAddress,
            functionName: "itemList",
            params: {
                nftAddress: nftAddress,
                tokenID: tokenId,
                price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: () => listSuccess(),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function listSuccess() {
        dispatch({
            type: "success",
            message: "Your NFT is being listed",
            title: "NFT Listed",
            position: "topR",
        })
    }

    return (
        <div>
            {isWeb3Enabled && chainId ? (
                marketPlaceAddress ? (
                    <Form
                        onSubmit={approveAndList}
                        data={[
                            {
                                name: "NFTAddress",
                                type: "text",
                                inputWidth: "50%",
                                value: address ? address : "",
                                key: "nftAddress",
                            },
                            {
                                name: "Token ID",
                                type: "number",
                                value: id ? id : "",
                                key: "tokenId",
                                name: "tokenId",
                            },
                            {
                                name: "Price (ETH)",
                                type: "number",
                                value: "",
                                key: "price",
                            },
                        ]}
                        title="Sell NFTs!"
                        id="Selling Form"
                    ></Form>
                ) : (
                    <div className="p-2 m-6">
                        Network error, please switch to a supported network.{" "}
                    </div>
                )
            ) : (
                <div className="p-2 m-6">Web3 Currently Not Enabled</div>
            )}
        </div>
    )
}
