import { useState } from "react"
import { Modal, Input, useNotification } from "web3uikit"
import { useWeb3Contract } from "react-moralis"
import { marketplaceAbi } from "../constants/index"
import { ethers } from "ethers"

export default function ListingUpdate({
    nftAddress,
    tokenId,
    isVisible,
    marketplaceAddress,
    onClose,
}) {
    const [newPrice, setNewPrice] = useState(0)

    const dispatch = useNotification()

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: marketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenID: tokenId,
            priceUpdated: ethers.utils.parseEther(newPrice || "0"),
        },
    })

    async function listingSuccess() {
        dispatch({
            type: "success",
            message: "Price Updated",
            title: "Price updated, please refresh the window",
            position: "topR",
        })
        onClose && onClose()
        isVisible = false
        setNewPrice(0)
    }

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                updateListing({
                    onError: (error) => {
                        console.log(error)
                    },
                    onSuccess: () => listingSuccess(),
                })
            }}
        >
            <Input
                label="Update Price (ETH)"
                name="New Price"
                type="number"
                onChange={(event) => {
                    setNewPrice(event.target.value)
                }}
            />
        </Modal>
    )
}
