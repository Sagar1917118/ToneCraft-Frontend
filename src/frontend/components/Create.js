import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import axios from 'axios';
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        // const result = await client.add(file)
        const formData=new FormData();
        formData.append("audio",file);
        const result=await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/upload`,formData);
        // ?user=${process.env.REACT_APP_USER}&password=${process.env.REACT_APP_PASSWORD}`);
        console.log(result)
        const ipfsResponse=await axios.get(`https://azure-realistic-vicuna-515.mypinata.cloud/ipfs/${result.data.IpfsHash}?pinataGatewayToken=${process.env.REACT_APP_GATEWAY_TOKEN}`);
        setImage(ipfsResponse);
      } catch (error){
        console.log("pinata pdf upload error: ", error)
      }
    }
  }
  const createNFT = async () => {
    console.log("I am in createNFT",image);
    if (!image || !price || !name || !description) return
    try{
      const fData=JSON.stringify({image, price, name, description});
      const result =await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/nft`,{data:fData});
      mintThenList(result)
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }
  const mintThenList = async (result) => {
    const uri = `https://azure-realistic-vicuna-515.mypinata.cloud/ipfs/${result.data.IpfsHash}?pinataGatewayToken=${process.env.REACT_APP_GATEWAY_TOKEN}`
    // mint nft 
    await(await nft.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await nft.tokenCount()
    // approve marketplace to spend nft
    await(await nft.setApprovalForAll(marketplace.address, true)).wait()
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
  }
  return (
    <div className="container-fluid mt-5 ">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create