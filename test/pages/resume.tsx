import { Suspense } from "react";
import { useState, useEffect } from "react";
import pdfToText from "react-pdftotext";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { FaRegFile } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/router";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { authService } from '../services/authService';
import { API_ENDPOINTS } from '../config/api';

interface Experience {
    company?: string;
    title?: string;
    startYear?: string;
    endYear?: string;
    location?: string;
    description?: string;
}

interface Education {
    university?: string;
    degree?: string;
    gpa?: string;
    startYear?: string;
    endYear?: string;
}

interface Output {
    personal_information?: {
        name?: string;
        title?: string;
        city?: string;
    };
    contact?: {
        email?: string;
        phone?: string;
        linkedin?: string;
    };
    experience?: Experience[];
    education?: Education[];
    additional_information?: {
        technical_skills?: string;
    };
}

function ResumeContent() {
    const [pdfPreview, setPdfPreview] = useState<string | null>(null);
    const [tab, setTab] = useState<string>("summarize");
    const router = useRouter();
    const jobId = router.query.jobId as string;
    const [numPages, setNumPages] = useState<number | null>(null);
    const [scale, setScale] = useState(0.5);
    const [showAllPages, setShowAllPages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [output, setOutput] = useState<Output | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!jobId) {
            router.push("/dashboard");
        }
    }, [jobId, router]);

    useEffect(() => {
        const handleResize = () => {
            setScale(window.innerWidth < 768 ? 1 : 0.5);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setError(null);
            try {
                const extractedText = await pdfToText(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setPdfPreview(event.target.result as string);
                    }
                };
                reader.readAsDataURL(file);

                const token = authService.getToken();
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Get job details
                const jobResponse = await fetch(`${API_ENDPOINTS.jobs}/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!jobResponse.ok) {
                    throw new Error('Failed to fetch job details');
                }

                const jobData = await jobResponse.json();
                const parsedOutput = await handleOpenAI(e, extractedText, jobData);

                if (!parsedOutput) {
                    throw new Error('Failed to analyze resume');
                }

                // Build candidate payload sesuai backend
                const candidatePayload = {
                    jobId,
                    name: parsedOutput.personal_information?.name || '',
                    location: parsedOutput.personal_information?.city || '',
                    resumeData: parsedOutput,
                };

                const response = await fetch(API_ENDPOINTS.candidates, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(candidatePayload)
                });
                if (response.ok) {
                    alert('Candidate berhasil dibuat!');
                }
            } catch (error) {
                console.error('Error processing resume:', error);
                setError(error instanceof Error ? error.message : 'Failed to process resume');
            }
        }
    };

    const handleRemovePdf = () => {
        setPdfPreview(null);
        setOutput(null);
        const fileInput = document.getElementById("pdfInput") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    const handleTab = () => {
        setTab(tab === "summarize" ? "raw" : "summarize");
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleOpenAI = async (
        e: React.ChangeEvent<HTMLInputElement>,
        data: string,
        jobData?: any
    ) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.resume, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resumeText: data })
            });
            if (!response.ok) {
                throw new Error('Failed to analyze resume');
            }
            const parsedOutput = await response.json();
            setOutput(parsedOutput);
            return parsedOutput;
        } catch (error) {
            console.error("Error:", error);
            setError(error instanceof Error ? error.message : 'Failed to process resume');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbfc]">
            <nav className="bg-white p-4 border-b border-gray-200">
                <div className="container mx-auto">
                    <Link href="/dashboard">
                        <span className="text-lg font-bold cursor-pointer hover:text-gray-700 transition-colors">Warkop</span>
                    </Link>
                </div>
            </nav>

            <div className="w-full bg-white shadow-sm p-4">
                {/* ...lanjutan kode dari ResumeContent ... */}
            </div>
        </div>
    );
}

export default function ResumePage() {
    return <ResumeContent />;
} 