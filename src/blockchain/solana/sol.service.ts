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
import { promises as fs } from 'fs';
import axios from 'axios';
import * as sharp from 'sharp';

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

  private async downloadImageFromIPFS(ipfsUrl: string, filename: string): Promise<string> {
    try {
      const response = await axios.get(ipfsUrl, { responseType: 'arraybuffer' });
      if (response.status !== 200) throw new Error(`Failed to fetch image: ${response.statusText}`);

      // Use the /tmp directory for temporary storage in Google Cloud environment
      const outputPath = `/tmp/${filename}`;

      // Write the file directly without checking if the directory exists
      // The /tmp directory is guaranteed to exist, but you may still want to catch errors
      await fs.writeFile(outputPath, response.data);
      console.log(`Image downloaded to: ${outputPath}`);

      // Return the outputPath so it can be used for further processing
      return outputPath;
    } catch (error) {
        console.error('Error downloading image from IPFS:', error);
        // Return or throw an error indicating that the image path could not be created or returned
        throw error; // Or you can return an empty string or a specific error message depending on how you want to handle the error.
    }
  }

  private async resizeImage(inputPath: string, outputPath: string, size: number) {
    await sharp(inputPath)
        .resize(size, size) // Resize the image to 500x500 pixels
        .toFile(outputPath); // Save the resized image
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
      let image_url = await this.aiService.predict(42, `A ${color} ${location} ${prompt} ${userInput} that looks ${emotion.toLowerCase()}`);

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
    //const SOLANA_CONNECTION = new solanaWeb3.Connection(QUICKNODE_RPC);
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

    const uploadImage = async () => {
      const irys = await getIrys();
      const originalFilePath = '/tmp/downloadedImage.png';
      const resizedFilePath = '/tmp/resized-downloadedImage.png';
  
      // Resize the image before uploading
      try {
          await this.resizeImage(originalFilePath, resizedFilePath, 500);
      } catch (error) {
          console.error("Error resizing the image: ", error);
          throw error; // Consider how you want to handle this error.
      }
      const token = "solana";  
      // Proceed with the upload process
      // Get size of resized file
      const { size } = await fs.stat(resizedFilePath);
      const price = await irys.getPrice(size);
      console.log(`Uploading ${size} bytes costs ${irys.utils.fromAtomic(price)} ${token}`);
  
      // Fund the node
      await irys.fund(price);
  
      // Upload the resized image
      try {
          const response = await irys.uploadFile(resizedFilePath);
          console.log(`File uploaded ==> https://gateway.irys.xyz/${response.id}`);
          return `https://gateway.irys.xyz/${response.id}`;
      } catch (e) {
          console.error("Error uploading file: ", e);
          throw e;
      }
    };

    const metaData = await this.generateMetadata(prompt, userInput);
    console.log('metaData :', metaData);
    const { name, description, external_url, image, attributes } = metaData;

    this.downloadImageFromIPFS(image, 'downloadedImage.png');
    const image_url = await uploadImage();

     const CONFIG = {
       uploadPath: image_url,
       imgFileName: `${name}.png`,
       imgType: 'image/png',
       imgName: name,
       description: description,
       external_url: external_url,
       attributes: attributes,
       sellerFeeBasisPoints: 500, //500 bp = 5%
       symbol: 'SCF',
       creators: [
           {address: WALLET.publicKey, share: 100}
       ],
        files: [
          {
            uri: image_url,
            type: 'image/png',
          },
        ],
      };
    
    /*const CONFIG = {
      uploadPath: 'https://ibb.co/9NPqzYk',
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
      ],
      files: [
        {
          uri: 'https://ibb.co/9NPqzYk',
          type: 'image/png',
        },
      ],
    };*/

    const data = JSON.stringify(CONFIG);
    const uri = await uploadMetadata(data);
  
    console.log('uri :', uri);
    const assetAddress = generateSigner(umi);
    const result = await createV1(umi, {
      asset: assetAddress,
      name: 'Scarif NFT',
      uri: uri,
    }).sendAndConfirm(umi);
    console.log('assetAddress :', assetAddress.publicKey);
    console.log('result :', result);
    
    return `Minted NFT: https://core.metaplex.com/explorer/${assetAddress.publicKey}?env=devnet`;

  }
}