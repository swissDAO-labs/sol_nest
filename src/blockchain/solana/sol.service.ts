import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as solanaWeb3 from '@solana/web3.js';
import { AIService } from 'src/ai/ai.service';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { generateSigner, signerIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi';
import { createV1 } from '@metaplex-foundation/mpl-core';
import Irys from "@irys/sdk";
// import { useWallet } from '@solana/wallet-adapter-react'
import * as bs58 from 'bs58';

@Injectable()
export class SolanaService {
  // const connectedWallet = useWallet();
  constructor(private aiService: AIService) {}

  private readonly locations = ['Inside', 'Outside'];
  private readonly colors = ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange', 'Black', 'White'];
  private readonly emotions = ['Joyful', 'Melancholy', 'Excited', 'Calm', 'Anxious', 'Serene', 'Curious'];

  private getRandomElement(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }

  public getConnection(rpcUrl: string): solanaWeb3.Connection {
    return new solanaWeb3.Connection(rpcUrl, 'confirmed');
  }

  public async getLastBlock(rpcUrl: string): Promise<number> {
    try {
        const connection = this.getConnection(rpcUrl);
        const lastBlock = await connection.getSlot();
        return lastBlock;
    } catch (error) {
        throw new Error(`${error.message} for getLastBlock`);
    }
  }

  public async getBlockData(rpcUrl: string, blockNumber: number): Promise<solanaWeb3.BlockResponse> {
    try {
        const connection = this.getConnection(rpcUrl);
        const block = await connection.getBlock(blockNumber);
        console.log(block, 'block')
        return block;
    } catch (error) {
        throw new Error(`${error.message} for getBlockData from shared solana service`);
    }
  }

  public async generateMetadata(prompt: string, userInput: string) {

    const location = this.getRandomElement(this.locations);
    const color = this.getRandomElement(this.colors);
    const emotion = this.getRandomElement(this.emotions);

    try {
      let image_url = await this.aiService.predict(1, `A ${color} ${location} ${prompt} ${userInput} that looks ${emotion.toLowerCase()}`);

      if (!image_url) {
        throw new HttpException('Error generating image', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const metaData = {
        name: 'Scarif NFT',
        description: `A ${color} ${location} ${prompt} ${userInput} that looks ${emotion.toLowerCase()}`,
        external_url: 'scarif.xyz',
        image: image_url,
        attributes: [
          {
            "trait_type": "location",
            "value": location
          },
          {
            "trait_type": "color",
            "value": color
          },
          {
            "trait_type": "emotion",
            "value": emotion
          }
        ]
      };
      
      return metaData;

    } catch (error) {
      throw new HttpException('AI Service failed to predict the image: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  public async mintNFT(walletAddress: string, prompt: string, userInput: string): Promise<string> {
    console.log('mintNFT');
    const QUICKNODE_RPC = 'https://proportionate-wider-diamond.solana-devnet.quiknode.pro/19ed12d6e746c89d77e41742081cd0e015c44e61/';
    const SOLANA_CONNECTION = new solanaWeb3.Connection(QUICKNODE_RPC);
    const privateKey = '9iKxJ1d2MB4So7P9XpXWzsxVgAgkygJb6RbLUMYp8rfUUjwykzWAf2nsMKJTtbUU2PQ7yvf2TPz7FHL9cZcZri3'
    const decodedSecretKey = bs58.decode(privateKey);
    const WALLET = solanaWeb3.Keypair.fromSecretKey(decodedSecretKey);

   
    const umi = createUmi(QUICKNODE_RPC)
      .use(mplCore())
      .use(dasApi());
      // .use(walletAdapterIdentity(connectedWallet)); // Use this if you want to use the wallet adapter and have the user sign transactions
    const walletKP = umi.eddsa.createKeypairFromSecretKey(WALLET.secretKey);
    const signer = createSignerFromKeypair(umi, walletKP);
    umi.use(signerIdentity(signer));

    const getIrys = async () => {
      console.log("Connecting to Irys");
      const network = "devnet"; // or "mainnet"
      const token = "solana";

      const irys = new Irys({
        network, // URL of the node you want to connect to
        token, // Token used for payment
        key: privateKey, //SOL private key in base58 format
        config: { providerUrl: QUICKNODE_RPC }, // Optional provider URL, only required when using Devnet
      });
      console.log("Irys connected")
      return irys;
    };
    
    const uploadMetadata = async (data) => {
      console.log("Uploading metadata");
      try {
        const irys = await getIrys();
        const serialized = JSON.stringify(data);
     
        // fund (if needed)
        const price = await irys.getPrice(new Blob([serialized]).size);
        await irys.fund(price);
     
        const tx = await irys.upload(serialized, {
          tags: [{ name: "Content-Type", value: "application/json" }],
        });
     
        console.log(`Upload success content URL= https://gateway.irys.xyz/${tx.id}`);
     
        return `https://gateway.irys.xyz/${tx.id}`;
      } catch (e) {
        console.log("error on upload ", e);
      }
      return "";
    };
    console.log('pre metadata');

    // const uploadImage = async () => {
    //   const irys = await getIrys();
    //   // write the image to the vercel tmp directory
    //   const fileToUpload = `/tmp/${fileName}.png`;
    //   const token = "solana";
    //   // Get size of file
    //   const { size } = await fs.promises.stat(fileToUpload);
    //   // Get cost to upload "size" bytes
    //   const price = await irys.getPrice(size);
    //   console.log(
    //     `Uploading ${size} bytes costs ${irys.utils.fromAtomic(
    //       price,
    //     )} ${token}`,
    //   );
    //   // Fund the node
    //   await irys.fund(price);

    //   // Upload metadata
    //   try {
    //     const response = await irys.uploadFile(fileToUpload);

    //     console.log(
    //       `File uploaded ==> https://gateway.irys.xyz/${response.id}`,
    //     );
    //     return `https://gateway.irys.xyz/${response.id}`;
    //   } catch (e) {
    //     console.log("Error uploading file ", e);
    //   }
    // };
    // const image_url = await uploadImage();


    // const metaData = await this.generateMetadata(prompt, userInput);
    // console.log('metaData :', metaData);
    
    // const { name, description, external_url, image, attributes } = metaData;

    // const CONFIG = {
    //   uploadPath: image,
    //   imgFileName: `${name}.png`,
    //   imgType: 'image/png',
    //   imgName: name,
    //   description: description,
    //   attributes: attributes,
    //   sellerFeeBasisPoints: 500, //500 bp = 5%
    //   symbol: 'SCF',
    //   creators: [
    //       {address: WALLET.publicKey, share: 100}
    //   ]
    // };

      const CONFIG = {
      uploadPath: 'https://ivory-fancy-hamster-735.mypinata.cloud/ipfs/QmRzjNUsscdDfaqzbRwU4zZhcp392nchMsnaBLUAZEd16g',
      imgFileName: `eyo.png`,
      imgType: 'image/png',
      imgName: 'eyo',
      description: 'yeye',
      attributes: [
        {trait_type: 'Speed', value: 'Quick'},
        {trait_type: 'Type', value: 'Pixelated'},
        {trait_type: 'Background', value: 'QuickNode Blue'}
      ],
      sellerFeeBasisPoints: 500, //500 bp = 5%
      symbol: 'SCF',
      creators: [
          {address: WALLET.publicKey, share: 100}
      ]
    };
    const data = JSON.stringify(CONFIG);
    const uri = await uploadMetadata(data);
  
    console.log('uri :', uri);
    const assetAddress = generateSigner(umi);
    const result = await createV1(umi, {
      asset: assetAddress,
      name: 'My Nft',
      uri: uri,
    }).sendAndConfirm(umi);
    console.log('assetAddress :', assetAddress.publicKey);
    console.log('result :', result);
    
    return `Minted NFT: https://core.metaplex.com/explorer/${assetAddress.publicKey}?env=devnet`;
  }
}