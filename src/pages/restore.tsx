import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useRef } from "react";
import { UploadDropzone } from "react-uploader";
import { Uploader } from "uploader";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import appendNewToName from "../utils/appendNewToName";
import downloadPhoto from "../utils/downloadPhoto";
import CountUp from "react-countup";
import FAQ from "../components/FAQ";
import SquigglyLines from "../components/SquigglyLines";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

const uploader = Uploader({ apiKey: "free" });
const options = {
    maxFileCount: 1,
    mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
    editor: { images: { crop: false } },
    styles: { colors: { primary: "#000" } },
};

const Restore: NextPage = () => {
    const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [photoName, setPhotoName] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const UploadDropZone = () => (
        <UploadDropzone
            uploader={uploader}
            options={options}
            onUpdate={(file: any) => {
                if (file.length !== 0) {
                    setPhotoName(file[0].originalFile.originalFileName);
                    const fileUrl = file[0].fileUrl;
                    setOriginalPhoto(fileUrl);
                    setEnhancedImage(null);
                }
            }}
            width="670px"
            height="250px"
        />
    );

    function enhanceImage(fileUrl: string) {
        setLoading(true);
        setError(null);

        const img = new window.Image(); // Use window.Image to ensure correct context
        img.crossOrigin = "Anonymous"; // Set crossOrigin attribute
        img.src = fileUrl;

        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image on canvas
            ctx.drawImage(img, 0, 0);

            // Get image data
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;

            // Enhance colors and sharpness
            for (let i = 0; i < data.length; i += 4) {
                // Increase brightness and contrast
                data[i] += 20;     // Red
                data[i + 1] += 20; // Green
                data[i + 2] += 20; // Blue

                // Simple sharpening filter (increase surrounding pixels)
                if (i > 4 && i < data.length - 4) {
                    data[i] += (data[i - 4] + data[i + 4]) / 8;     // Red
                    data[i + 1] += (data[i - 3] + data[i + 5]) / 8; // Green
                    data[i + 2] += (data[i - 2] + data[i + 6]) / 8; // Blue
                }
            }

            // Put enhanced image back to canvas
            ctx.putImageData(imageData, 0, 0);

            // Create a new image URL for the enhanced image
            const enhancedImageUrl = canvas.toDataURL("image/jpeg");
            setEnhancedImage(enhancedImageUrl);
            setLoading(false);
        };

        img.onerror = () => {
            setError("An error occurred while processing the image.");
            setLoading(false);
        };
    }

    return (
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center py-2">
            <Head>
                <title>Restore Blurred Face Photos - RestorePhotos App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />
            <main className="sm:mt-15 mt-12 flex w-full flex-1 flex-col items-center justify-center px-4 text-center">
                <span className="mx-auto mb-5 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-blue-100 px-7 py-2 text-sm font-semibold text-[#1d9bf0] transition-colors hover:bg-blue-200">
                    <Link href="/captions">
                        <Balancer>
                            Ready to elevate your photo captions with AI? Try it now!
                        </Balancer>
                    </Link>
                </span>

                <h2 className="font-display mx-auto mb-5 max-w-4xl text-4xl font-bold tracking-normal text-slate-900 sm:text-6xl">
                    <Balancer>
                        See Your Loved Ones’ Faces in{" "}
                        <span className="relative whitespace-nowrap text-[#3290EE]">
                            <SquigglyLines />
                            <span className="relative">Perfect Clarity</span>
                        </span>{" "}
                        With RestorePhotos.app
                    </Balancer>
                </h2>

                <p className="text-slate-500">
                    <CountUp start={5000} end={7081} /> face restoration and counting.
                </p>

                <ResizablePanel>
                    <AnimatePresence mode="wait">
                        <motion.div className="mt-0 flex w-full flex-col items-center justify-between">
                            {!originalPhoto && <UploadDropZone />}
                            {originalPhoto && (
                                <div>
                                    <Image
                                        alt="original photo"
                                        src={originalPhoto}
                                        className="rounded-2xl"
                                        width={475}
                                        height={475}
                                    />
                                    <button
                                        onClick={() => enhanceImage(originalPhoto!)}
                                        className="mt-4 rounded-full bg-black px-4 py-2 text-lg text-white transition hover:bg-black/80"
                                    >
                                        Enhance
                                    </button>
                                </div>
                            )}
                            {enhancedImage && (
                                <div className="flex flex-col">
                                    <h2 className="mb-1 text-lg">Enhanced Photo</h2>
                                    <a href={enhancedImage} target="_blank" rel="noreferrer">
                                        <Image
                                            alt="enhanced photo"
                                            src={enhancedImage}
                                            className="relative mt-2 cursor-zoom-in rounded-2xl"
                                            width={475}
                                            height={475}
                                        />
                                    </a>
                                </div>
                            )}
                            {loading && (
                                <button
                                    disabled
                                    className="mt-8 w-40 rounded-full bg-black px-4 pt-2 pb-3 text-lg text-white hover:bg-black/80"
                                >
                                    <span className="pt-4">
                                        <LoadingDots color="white" style="large" />
                                    </span>
                                </button>
                            )}
                            {error && (
                                <div
                                    className="relative mt-8 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                                    role="alert"
                                >
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}
                            <div className="flex justify-center space-x-2">
                                {originalPhoto && (
                                    <button
                                        onClick={() => {
                                            setOriginalPhoto(null);
                                            setEnhancedImage(null);
                                        }}
                                        className="mt-8 rounded-full border bg-white px-4 py-2 text-lg text-black transition hover:bg-gray-100"
                                    >
                                        Upload New Photo
                                    </button>
                                )}
                                {enhancedImage && (
                                    <button
                                        onClick={() =>
                                            downloadPhoto(enhancedImage!, appendNewToName(photoName!))
                                        }
                                        className="mt-8 rounded-full bg-black px-4 py-2 text-lg text-white transition hover:bg-black/80"
                                    >
                                        Download Enhanced Photo
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </ResizablePanel>

                {/* Canvas for processing images */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
            </main>
            <FAQ startId={1} endId={27} />
            <Footer />
        </div>
    );
};

export default Restore;