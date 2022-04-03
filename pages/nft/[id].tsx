import React, { useEffect, useState } from 'react'
import { useAddress, useDisconnect, useMetamask, useNFTDrop } from "@thirdweb-dev/react";
import { GetServerSideProps } from 'next';
import { sanityClient, urlFor } from '../../sanity'
import { Collection } from '../../typing';
import Link from 'next/link';
import { BigNumber } from 'ethers';
import toast, { Toaster } from 'react-hot-toast'

interface Props {
    collection: Collection
}

function NFTDropPage({ collection }: Props) {

    const [claimedSupply, setClaimedSupply] = useState<number>(0);
    const [totalSupply, setTotalSupply] = useState<BigNumber>();
    const [priceInEth, setPriceInEth] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true); //set to true
    const nftDrop = useNFTDrop(collection.address)

    //Auth----
    const connectWithMetamask = useMetamask()
    const address = useAddress();
    const disconnect = useDisconnect();
    //--------

    useEffect(() => {

        if (!nftDrop) return

        const fetchPrice = async () => {
            const cliamConditions = await nftDrop.claimConditions.getAll();
            setPriceInEth(cliamConditions?.[0].currencyMetadata.displayValue)
        }

        fetchPrice();

    }, [nftDrop])

    useEffect(() => {
        if (!nftDrop) return;

        const fetchNFTDropData = async () => {

            setLoading(true);

            const claimed = await nftDrop.getAllClaimed();
            const total = await nftDrop.totalSupply();

            setClaimedSupply(claimed.length);
            setTotalSupply(total)

            setLoading(false);

        }
        fetchNFTDropData()
    }, [nftDrop])

    const mintNft = () => {

        if (!nftDrop || !address) return;

        setLoading(true);

        const notification = toast.loading('Minting NFT...', {
            style: {
                backgroundColor: "white",
                color: "green",
                fontWeight: "bolder",
                fontSize: "17px",
                padding: "20px"
            }
        })

        const quantity = 1; //how many unique nft want to mint

        nftDrop.claimTo(address, quantity).then(async (tx) => {
            const receipt = tx[0].receipt // the transaction receipt
            const claimedTokenId = tx[0].id // the id of cliamed NFT
            const cliamedNFT = await tx[0].data() // (optional) get the claimed NFT metadata

            toast("HOORAY...You Successfully Minted!", {
                duration: 5000,
                style: {
                    backgroundColor: "green",
                    color: "white",
                    fontWeight: "bolder",
                    fontSize: "17px",
                    padding: "20px"

                }
            })

            console.log(receipt)
            console.log(claimedTokenId)
            console.log(cliamedNFT)
        }).catch(err => {
            console.log(err)
            toast("Whoopss... Something went wrong!", {
                style: {
                    backgroundColor: "red",
                    color: "white",
                    fontWeight: "bolder",
                    fontSize: "17px",
                    padding: "20px"
                }
            })
        }).finally(() => {
            setLoading(false)
            toast.dismiss(notification)
        })
    }


    return (
        <div className="flex flex-col h-screen lg:grid lg:grid-cols-10 ">

            <Toaster position="bottom-center" />



            {/* Left */}
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 lg:col-span-4" >
                <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen" >
                    <div className="p-2 shadow-2 xl rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600" >
                        <img className="object-cover w-44 rounded-xl lg:h-96 lg:w-72" src={urlFor(collection.previewImage).url()} />
                    </div>
                    <div className='p-5 space-y-2 text-center' >
                        <h1 className="text-4xl font-bold text-white" >
                            {collection.nftCollectionName}
                        </h1>
                        <h3 className="text-xl text-gray-300" >{collection.description} </h3>
                    </div>
                </div>
            </div>



            {/* Right */}
            <div className="flex flex-col flex-1 p-12 lg:col-span-6 " >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href={"/"}>
                        <h1 className="text-xl cursor-pointer w-52 font-extralight sm:w-80" >
                            The <span className="font-extrabold underline decoration-pink-600/50" > PAPAFAM</span> NFT Market Place
                        </h1>
                    </Link>

                    <button onClick={() => address ? disconnect() : connectWithMetamask()} className="px-4 py-2 text-xs font-bold text-center text-white rounded-full bg-rose-400 lg:px-5 lg:py-3 lg:text-base">
                        {address ? "Sign Out" : "Sign In"}
                    </button>
                </div>

                <hr className="my-1 border" />

                {address && (
                    <p className="text-sm text-center text-rose-400" >
                        You're logged in with wallet {address.substring(0, 5)}...{address.substring(address.length - 5)}
                    </p>
                )}

                {/* Content */}
                <div className="flex flex-col items-center flex-1 mt-10 space-y-6 text-center lg:space-y-0 lg:justify-center" >
                    <img className="object-cover pb-10 w-80 lg:h-40" src={urlFor(collection.mainImage).url()} alt="" />

                    <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold" >
                        {collection.title}
                    </h1>

                    {loading ? (
                        <p className="pt-2 text-xl text-green-500 animate-pulse" >
                            Loading Supply Count...
                        </p>

                    ) : (
                        <p className="pt-2 text-xl text-green-500" >
                            {claimedSupply} / {totalSupply?.toString()} NFT's Claimed
                        </p>
                    )}

                    {loading && (
                        <img className="object-contain w-80 " src='https://cdn.dribbble.com/users/1186261/screenshots/3718681/media/1df2396f1eaa146bcb7dd3e73c1dc77b.gif' alt="Loading" />

                    )}

                </div>


                {/* Mint Button */}

                <button onClick={mintNft} disabled={loading || claimedSupply === totalSupply?.toNumber() || !address} className="w-full h-16 mt-2 font-bold text-white bg-red-600 rounded-full disabled:bg-slate-400" >

                    {loading ? (
                        <>Loading...</>
                    ) : claimedSupply === totalSupply?.toNumber() ? (
                        <>Oopps... Sold Out</>
                    ) : !address ? (
                        <>Sign in to Mint</>
                    ) : (
                        <span className="font-bold" >
                            Mint NFT ({priceInEth} ETH)
                        </span>
                    )
                    }
                </button>
            </div>
        </div >
    )
}

export default NFTDropPage


export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const query = `*[_type == "collection" && slug.current==$id ][0]{
        _id,
        title,
        description,
        nftCollectionName,
        address,
        mainImage {
            asset
        },
        previewImage {
            asset
        },
        slug {
            current
        },
        creator-> {
            _id,
            name,
            address,
            slug {
              current
            },
        }, 
        
    }`

    const collection = await sanityClient.fetch(query, {
        id: params?.id
    })

    if (!collection) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            collection
        }
    }
}