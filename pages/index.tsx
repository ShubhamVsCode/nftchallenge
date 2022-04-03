import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import { sanityClient, urlFor } from '../sanity'
import { Collection } from '../typing';

interface Props {
  collections: Collection[];
}

const Home = ({ collections }: Props) => {
  return (
    <div className="flex flex-col px-10 py-20 mx-auto max-w-7xl 2xl:px-0" >
      <Head>
        <title>NFT Drop Challenge</title>
      </Head>

      <h1 className="mb-10 text-4xl font-extralight " >
        The <span className="font-extrabold underline decoration-pink-600/50" > PAPAFAM</span> NFT Market Place
      </h1>

      <main className="p-10 shadow-xl shadow-rose-400/2 bg-slate-100" >
        <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" >
          {collections.map((collection) => (
            <Link href={`/nft/${collection.slug.current}`}>
              <div className="flex flex-col items-center transition-all duration-200 cursor-pointer hover:scale-105" >
                <img className="object-cover h-96 w-60 rounded-2xl"
                  src={urlFor(collection.mainImage).url()}
                  alt="" />

                <div className="p-5">
                  <h2 className="text-3xl" >
                    {collection.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-400" >
                    {collection.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `*[_type == "collection"]{
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
  const collections = await sanityClient.fetch(query)
  console.log(collections)

  return {
    props: {
      collections
    }
  }
}