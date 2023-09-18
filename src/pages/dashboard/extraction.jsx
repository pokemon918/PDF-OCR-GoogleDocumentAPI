import React from "react";
import { Stepper, Step, Button, Typography, Card, Textarea } from "@material-tailwind/react";
import { BookOpenIcon, CogIcon, WrenchScrewdriverIcon, CloudArrowUpIcon, MagnifyingGlassCircleIcon, PlayIcon} from "@heroicons/react/24/outline";
import axios from "axios";
import _ from "lodash";

export function Extraction() {

    const [activeStep, setActiveStep] = React.useState(0);
    const [isLastStep, setIsLastStep] = React.useState(false);
    const [uploading, setUploading] = React.useState("");
    const [images, setImage] = React.useState([]);
    const [total, setTotal] = React.useState([]);
    const [texts, setText] = React.useState([]);
    const [metaData, setMetaData] = React.useState("");
    const [selectedImage, setSelectedImage] = React.useState(0);
   
    const handleNext = () => {
        if (activeStep === 2) {
            imageUpload();
        } else {
            !isLastStep && setActiveStep((cur) => cur + 1)

        }
        
    };
    const chopOff = () => {
        const temp = images;
        temp.splice(selectedImage, 1);
        setImage(temp);
        setSelectedImage(0);
    };
    const fileUpload = async (formData) => {
        try {
            setUploading("start");
            setIsLastStep(true);
            const response = await axios.post(
              `http://localhost:8000/process`, formData
            );
            setUploading("end");
            setIsLastStep(false);
            setImage(response.data.images);
            setTotal(JSON.parse(JSON.stringify(response.data.images)));
            setMetaData(response.data.metadata)
          } catch (err) {
            console.log(err);
          }
    }
    const imageUpload = async () => {
        let temp = [];
        _.map(images, (image, id) => {
            temp.push(total.indexOf(image));
        })
        try {
            setUploading("start");
            const response = await axios.post(
              `http://localhost:8000/upload`, {
                images: temp,
              }
            );
            setUploading("");
            !isLastStep && setActiveStep((cur) => cur + 1);
            setText(response.data.text);
          } catch (err) {
            console.log(err);
          }
    }
    const fileChange = (event) => {
        const formData = new FormData();
        formData.append('file', event.target.files[0]);
        fileUpload(formData);
    }
    const changeText = (event, id, imageId) => {
        texts[imageId][id] = event.target.value;
        const temp = texts;
        setText(temp);
        console.log(texts);
    }

    const mainBoard = (activeStep) => {
        if (activeStep === 0) {
            if (uploading === "start") {
                return (
                    <div className="text-center flex flex-col items-center justify-center h-[100%]">
                        <div role="status">
                            <svg aria-hidden="true" className="inline w-40 h-40 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                        <div className="text-[40px]">File Uploading...</div>
                    </div>
                )
            } else if (uploading === "end") {
                return (
                    <div className="text-center flex flex-col items-center justify-center h-[100%]">
                        <div className="text-[40px]">File Upload Completed</div>
                        <div className="text-[40px]">Press <span className="text-blue-500">[NEXT]</span> Button</div>
                    </div>
                )
            }
            return (
                <div className="w-[100%] h-[100%] flex items-center justify-center">
                    <div class="p-5 relative border-4 border-dotted border-gray-300 rounded-lg w-[450px]">
                        <svg class="text-indigo-500 w-24 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <div class="input_field flex flex-col w-max mx-auto text-center">
                            <label>
                                <input onChange={fileChange} class="text-sm cursor-pointer w-36 hidden" type="file" accept=".pdf" />
                                <div class="text bg-indigo-600 text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-indigo-500">Select</div>
                            </label>
                            <div class="title text-indigo-500 uppercase">or drop files here</div>
                        </div>
                    </div>
                </div>
            );
        } else if (activeStep === 1) {
            return (
                <div className="flex h-[100%]">
                    <div className="w-[15%] px-4 py-4 overflow-auto">
                        {_.map(images, (image, id) => {
                            return (
                                <figure>
                                    <img
                                        className={`w-full rounded-lg object-cover object-center border border-black cursor-pointer`}
                                        src={`data:image/jpeg;base64,${image}`}
                                        alt="pdf image"
                                    />
                                    <Typography as="caption" variant="small" className="mb-2 text-center font-normal text-black">
                                        Page {id + 1}
                                    </Typography>
                                </figure>
                            )
                        })}
                    </div>
                    <div className="w-[70%] border-l border-r h-[100%]">
                        <div className="flex justify-center flex-col items-center gap-2 text-[32px] py-12">
                            <div className="font-bold">{metaData.title}</div>
                            <div className="font-bold">Author</div>
                            <div>{metaData.author}</div>
                            <div className="font-bold">ISBN</div>
                            <div>{metaData.description}</div>
                        </div>
                    </div>
                    <div className="px-4 py-4 w-[15%] flex flex-col gap-4">
                        <div className="w-[100%] border border-black rounded-lg p-2 text-center cursor-pointer">
                            <div>Author Name</div>
                        </div>
                        <div className="w-[100%] border border-black rounded-lg p-2 text-center cursor-pointer">
                            <div>ISBN</div>
                        </div>
                        <div className="w-[100%] border border-black rounded-lg p-2 text-center cursor-pointer">
                            <div>Publish Date</div>
                        </div>
                    </div>
                </div>
            );
        } else if (activeStep === 2) {
            if (uploading === "start") {
                return (
                    <div className="text-center flex flex-col items-center justify-center h-[100%]">
                        <div role="status">
                            <svg aria-hidden="true" className="inline w-40 h-40 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                        <div className="text-[40px]">OCR Processing...</div>
                    </div>
                )
            }
            return (
                <div className="flex h-[100%]">
                    <div className="w-[15%] px-4 py-4 overflow-auto">
                        {_.map(images, (image, id) => {
                            return (
                                <figure>
                                    <img
                                        onClick={() => {setSelectedImage(id);}}
                                        className={`w-full rounded-lg object-cover object-center border border-${selectedImage === id ? "blue-500" : "black"} cursor-pointer`}
                                        src={`data:image/jpeg;base64,${image}`}
                                        alt="pdf image"
                                    />
                                    <Typography as="caption" variant="small" className={`mb-2 text-center font-normal text-${selectedImage === id ? "blue-500" : "black"}`}>
                                        Page {id + 1}
                                    </Typography>
                                </figure>
                            )
                        })}
                    </div>
                    <div className="w-[85%] border-l border-r h-[100%]">
                        <div className="w-[100%] justify-end flex pr-4 pt-4">
                            <Button onClick={chopOff}>Chop Off</Button>
                        </div>
                        <div className="flex justify-center flex-col items-center gap-2 text-[32px] pb-12">
                            <div className="font-bold">{metaData.title}</div>
                            <div className="font-bold">Author</div>
                            <div>{metaData.author}</div>
                            <div className="font-bold">ISBN</div>
                            <div>{metaData.description}</div>
                        </div>
                    </div>
                </div>
            );
        } else if (activeStep === 3) {
            return (
                <div className="flex h-[100%]">
                    <div className="w-[15%] px-4 py-4 overflow-auto">
                        {_.map(images, (image, id) => {
                            return (
                                <figure>
                                    <img
                                        onClick={() => {setSelectedImage(id);}}
                                        className={`w-full rounded-lg object-cover object-center border border-${selectedImage === id ? "blue-500" : "black"} cursor-pointer`}
                                        src={`data:image/jpeg;base64,${image}`}
                                        alt="pdf image"
                                    />
                                    <Typography as="caption" variant="small" className={`mb-2 text-center font-normal text-${selectedImage === id ? "blue-500" : "black"}`}>
                                        Page {id + 1}
                                    </Typography>
                                </figure>
                            )
                            })}
                    </div>
                    <div className="w-[70%] border-l border-r h-[100%] px-4 overflow-auto">
                        <div className="flex justify-center flex-col items-center gap-2 py-12 w-[100%]">
                            <img 
                                className={`w-full rounded-lg object-cover object-center`}
                                src={`data:image/jpeg;base64,${images[selectedImage]}`}
                            />
                        </div>
                    </div>
                    <div className="px-4 py-4 w-[15%] flex flex-col gap-4 overflow-auto">
                        {_.map(texts[selectedImage], (text, id) => {
                            return (
                                <Textarea className="w-[100%]" defaultValue={text} label="text" onChange={(event) => {changeText(event, id, selectedImage)}}/>
                            )
                        })}
                    </div>
                </div>
            );
        } else if (activeStep === 4) {
            return (
                <div className="flex h-[100%]">
                    <div className="px-4 py-4 w-[15%] flex flex-col gap-4">
                        <div className="w-[100%] border border-black rounded-lg p-2 text-center cursor-pointer">
                            <div>Author Name</div>
                        </div>
                        <div className="w-[100%] border border-black rounded-lg p-2 text-center cursor-pointer">
                            <div>ISBN</div>
                        </div>
                        <div className="w-[100%] border border-black rounded-lg p-2 text-center cursor-pointer">
                            <div>Publish Date</div>
                        </div>
                    </div>
                    <div className="w-[85%] border-l border-r h-[100%] overflow-auto">
                        <div className="flex justify-center flex-col items-center gap-2 text-[32px] py-4 px-4">
                            {_.map(texts, (text, id) => {
                                return (
                                    <>
                                        {_.map(text, (temp) => {
                                        return (
                                                <div className={`border border-black text-${temp.endsWith(".") ? "black" : "blue-500"} w-[100%] rounded-lg text-center`}>
                                                    {temp}
                                                </div>         
                                            )
                                        })}
                                    </>
                                )
                            })}
                        </div>
                    </div>
                </div>
            );
        }
    }
   
    return (
        <div className="w-full py-4 pr-4">
            <div className="px-24">
                <Stepper
                activeStep={activeStep}
                isLastStep={(value) => setIsLastStep(value)}
                >
                    <Step>
                        <CloudArrowUpIcon className="h-5 w-5" />
                        <div className="absolute -bottom-[2rem] w-max text-center">
                            <Typography variant="h6" color={activeStep === 0 ? "blue-gray" : "gray"}>
                                Upload PDF
                            </Typography>
                        </div>
                    </Step>
                    <Step>
                        <CogIcon className="h-5 w-5" />
                        <div className="absolute -bottom-[2rem] w-max text-center">
                            <Typography variant="h6" color={activeStep === 0 ? "blue-gray" : "gray"}>
                                Extract Metadata
                            </Typography>
                        </div>
                    </Step>
                    <Step>
                        <WrenchScrewdriverIcon className="h-5 w-5" />
                        <div className="absolute -bottom-[2rem] w-max text-center">
                            <Typography variant="h6" color={activeStep === 0 ? "blue-gray" : "gray"}>
                                Chop-off
                            </Typography>
                        </div>
                    </Step>
                    <Step>
                        <MagnifyingGlassCircleIcon className="h-5 w-5" />
                        <div className="absolute -bottom-[2rem] w-max text-center">
                            <Typography variant="h6" color={activeStep === 0 ? "blue-gray" : "gray"}>
                                OCR Processing & Review
                            </Typography>
                        </div>
                    </Step>
                    <Step>
                        <BookOpenIcon className="h-5 w-5" />
                        <div className="absolute -bottom-[2rem] w-max text-center">
                            <Typography variant="h6" color={activeStep === 0 ? "blue-gray" : "gray"}>
                                Outcome
                            </Typography>
                        </div>
                    </Step>
                </Stepper>
            </div>
            <Card color="white" className="w-full mt-12 h-[65vh]">
                {mainBoard(activeStep)}
            </Card>
            <div className="mt-8 flex justify-end">
                <Button className="w-[120px] flex items-center justify-center text-[16px] gap-1" onClick={handleNext} disabled={isLastStep}>
                    Next <PlayIcon className="h-7 w-7" />
                </Button>
            </div>
        </div>
    )
}

export default Extraction;
