from PyPDF2 import PdfFileReader
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
from google.oauth2 import service_account
import os
import fitz
from fastapi import FastAPI, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "./alef-ocr-test-f71582e010e7.json"

creds = service_account.Credentials.from_service_account_file(os.environ['GOOGLE_APPLICATION_CREDENTIALS'])

PROJECT_ID = 'alef-ocr-test'
LOCATION = 'us'
PROCESSOR_ID = '990c5ecf8d5c567d'

MIME_TYPE = "image/png"

docai_client = documentai.DocumentProcessorServiceClient(
    credentials=creds,
    client_options=ClientOptions(api_endpoint=f"{LOCATION}-documentai.googleapis.com")
)

RESOURCE_NAME = docai_client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)
IMAGES = []


@app.post("/upload/")
async def pdf_to_png(req: Request):
    global IMAGES
    temp = await req.json()
    indices = temp["images"]
    print(indices)
    result = {}
    result["text"] = []
    for index in indices:
        byte_image = IMAGES[index]
        text = process_image(byte_image.getvalue())
        res = text.split("\n")
        
        while "" in res:
            res.remove("")
        result["text"].append(res)
    return result


@app.post("/process/")
async def pdf_to_png_v2(req: Request, file: UploadFile = File(...)):
    global IMAGES
    file_content = await file.read()
    doc = fitz.open(stream=file_content, filetype="pdf")
    result = {}
    result["images"] = []
    meta = None
    images = []
    for i in range(len(doc)):
        page = doc.load_page(i)  # Number of page
        pix = page.get_pixmap()
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        byte_image = BytesIO()
        img.save(byte_image, format='JPEG')
        byte_image.seek(0)
        images.append(byte_image)

        if i == 0:
            meta = process_image(byte_image.getvalue())
        image_base64 = base64.b64encode(byte_image.getvalue()).decode("utf-8")
        result["images"].append(image_base64)
    IMAGES = images
    meta = meta.split("\n")
    result["metadata"] = {}
    result["metadata"]["title"] = meta[0]
    result["metadata"]["author"] = meta[1].split(":")[1]
    result["metadata"]["description"] = meta[2].split(":")[1]

    return result


def process_image(image):
    global MIME_TYPE, RESOURCE_NAME
    raw_document = documentai.RawDocument(content=image, mime_type=MIME_TYPE)
    request = documentai.ProcessRequest(name=RESOURCE_NAME, raw_document=raw_document)
    result = docai_client.process_document(request=request)
    document_object = result.document
    return document_object.text


def read_pdf_file(path_to_file):
    try:
        with open(path_to_file, "rb") as file:
            pdf = PdfFileReader(file)
            print(f'Number of pages: {pdf.getNumPages()}')
            print(f'Title: {pdf.getDocumentInfo().title}')

    except Exception as e:
        print(e)
