import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as solanaWeb3 from '@solana/web3.js';
import { Metaplex, keypairIdentity, toMetaplexFile, toBigNumber } from "@metaplex-foundation/js";
import { AIService } from 'src/ai/ai.service';
import * as bs58 from 'bs58';
import axios from 'axios';

@Injectable()
export class SolanaService {

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

    const QUICKNODE_RPC = 'https://proportionate-wider-diamond.solana-devnet.quiknode.pro/19ed12d6e746c89d77e41742081cd0e015c44e61/';
    const SOLANA_CONNECTION = new solanaWeb3.Connection(QUICKNODE_RPC);

    const decodedSecretKey = bs58.decode('9iKxJ1d2MB4So7P9XpXWzsxVgAgkygJb6RbLUMYp8rfUUjwykzWAf2nsMKJTtbUU2PQ7yvf2TPz7FHL9cZcZri3');
    const WALLET = solanaWeb3.Keypair.fromSecretKey(decodedSecretKey);

    console.log(WALLET);

    const METAPLEX = Metaplex.make(SOLANA_CONNECTION).use(keypairIdentity(WALLET));

    //const metaData = await this.generateMetadata(prompt, userInput);
    //const { name, description, external_url, image, attributes } = metaData;

    /*const CONFIG = {
      uploadPath: image,
      imgFileName: `${name}.png`,
      imgType: 'image/png',
      imgName: name,
      description: description,
      attributes: attributes,
      sellerFeeBasisPoints: 500, //500 bp = 5%
      symbol: 'SCF',
      creators: [
          {address: WALLET.publicKey, share: 100}
      ]
    };

    const { uri } = await METAPLEX
    .nfts()
    .uploadMetadata({
        name: 'Scarif',
        description: description,
        image: CONFIG.uploadPath,
        attributes: attributes,
        properties: {
            files: [
                {
                    type: CONFIG.imgType,
                    uri: CONFIG.uploadPath,
                },
            ]
        }
    });

    const { nft } = await METAPLEX
    .nfts()
    .create({
        uri: uri,
        name: name,
        sellerFeeBasisPoints: CONFIG.sellerFeeBasisPoints,
        symbol: CONFIG.symbol,
        creators: CONFIG.creators,
        isMutable: false,
    });*/
    
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

    const { uri } = await METAPLEX
    .nfts()
    .uploadMetadata({
        name: 'Scarif',
        description: 'eyo',
        image: CONFIG.uploadPath,
        attributes: [
          {trait_type: 'Speed', value: 'Quick'},
          {trait_type: 'Type', value: 'Pixelated'},
          {trait_type: 'Background', value: 'QuickNode Blue'}
        ],
        properties: {
            files: [
                {
                    type: CONFIG.imgType,
                    uri: CONFIG.uploadPath,
                },
            ]
        }
    });

    const { nft } = await METAPLEX
    .nfts()
    .create({
        uri: uri,
        name: 'eyo',
        sellerFeeBasisPoints: CONFIG.sellerFeeBasisPoints,
        symbol: CONFIG.symbol,
        creators: CONFIG.creators,
        isMutable: false,
    });

    return `Minted NFT: https://explorer.solana.com/address/${nft.address}?cluster=devnet`;

    /*(async () => {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const data = {
        jsonrpc: "2.0",
        id: 1,
        method: "cm_mintNFT",
        params: ["FILL_ME_ARG_1", "FILL_ME_ARG_2", "FILL_ME_ARG_3"],
      };

      try {
        const response = await axios.post(
          "https://proportionate-wider-diamond.solana-devnet.quiknode.pro/19ed12d6e746c89d77e41742081cd0e015c44e61/",
          data,
          config
        );
        console.log(response.data);
      } catch (err) {
        console.log(err);
      }
    })();*/
  }
}