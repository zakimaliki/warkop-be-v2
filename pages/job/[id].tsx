import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from '../../services/authService';
import { API_ENDPOINTS } from '../../config/api';
import useSWR from 'swr';

interface Timestamp {
    _seconds: number;
    _nanoseconds: number;
}

interface Interviewer {
    id: string;
    jobId: string;
    department: string;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

interface Candidate {
    id: string;
    jobId: string;
    name: string;
    location: string;
    resumeData: any;
    createdAt: Timestamp;
}

interface JobData {
    id: string;
    title: string;
    location: string;
    teamDescription: string;
    jobDescription: string;
    responsibilities: string[];
    recruitmentTeamName?: string;
    recruitmentManager?: string;
    recruitmentTeam?: {
        teamName: string;
        manager: string;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
    interviewers: Interviewer[];
    candidates: Candidate[];
}

interface JobDetail {
    id: string;
    title: string;
    location: string;
    description?: string;
    recruitmentTeamName?: string;
    recruitmentManager?: string;
    recruitmentTeam?: {
        teamName: string;
        manager: string;
    };
    updatedAt: Timestamp;
    responsibilities?: string[];
    interviewers?: Interviewer[];
    candidates?: Candidate[];
    teamDescription?: string;
    jobDescription?: string;
    // Add any other fields as needed
}

const fetcher = (url: string) => {
    const token = authService.getToken();
    return fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(res => {
        if (!res.ok) throw new Error('Failed to fetch job detail');
        return res.json();
    });
};

export default function JobDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const jobId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
    const { data: job, error, isLoading } = useSWR<JobDetail>(
        jobId ? `${API_ENDPOINTS.jobs}/${jobId}` : null,
        fetcher,
        { revalidateOnFocus: false }
    );
    const [jobData, setJobData] = useState<JobData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showAllCandidates, setShowAllCandidates] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchJobData = async () => {
            try {
                const token = authService.getToken();
                if (!token) {
                    throw new Error('No authentication token found');
                }
                const response = await fetch(`${API_ENDPOINTS.jobs}/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch job data');
                }
                const data = await response.json();
                setJobData(data);
            } catch (error) {
                console.error("Error fetching job data:", error);
                setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchJobData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-red-600">{error.message}</div>
            </div>
        );
    }

    if (!job) {
        return null;
    }

    const formatDate = (timestamp: Timestamp) => {
        return new Date(timestamp._seconds * 1000).toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
            <main className="flex-1 flex flex-col lg:flex-row gap-8 px-8 py-8 max-w-7xl mx-auto w-full">
                <section className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
                        <span className="flex items-center gap-1">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Diperbarui {formatDate(job.updatedAt)}
                        </span>
                    </div>

                    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                        <h2 className="font-bold text-lg mb-2">Tentang Tim</h2>
                        <p className="text-gray-700">{job.description}</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="font-bold text-lg mb-2">Tentang Pekerjaan</h2>
                        <p className="text-gray-700 mb-2">{job.description}</p>
                        <div>
                            <span className="font-bold">Tanggung Jawab:</span>
                            <ul className="list-disc ml-6 text-gray-700 mt-1 space-y-1">
                                {job.responsibilities?.map((responsibility: string, index: number) => (
                                    <li key={index}>{responsibility}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <aside className="w-full lg:w-[350px] flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-bold text-base">Hiring Team</div>
                        <div className="flex items-center gap-2">
                            <Link href={`/job/${id}/edit`}>
                                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 text-sm font-medium">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Edit Lowongan
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md mb-4">
                        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                            <div className="font-semibold text-gray-700">Team</div>
                            <div className="text-gray-900 text-right">{job.recruitmentTeamName || job.recruitmentTeam?.teamName}</div>
                            <div className="font-semibold text-gray-700">Hiring Manager</div>
                            <div className="text-gray-900 text-right">{job.recruitmentManager || job.recruitmentTeam?.manager}</div>
                            <div className="font-semibold text-gray-700 col-span-2 mt-2">Interviewers</div>
                            {jobData?.interviewers?.map((interviewer) => (
                                <React.Fragment key={interviewer.id}>
                                    <div className="text-gray-700">{interviewer.department}</div>
                                    <div className="text-gray-900 text-right">{interviewer.name}</div>
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mb-2 mt-6">
                            <div className="font-semibold text-gray-700">Candidates</div>
                            {jobData?.candidates && jobData.candidates.length > 10 && (
                                <button
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    onClick={() => setShowAllCandidates(!showAllCandidates)}
                                >
                                    {showAllCandidates ? 'Show less' : 'View all'}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                            {(showAllCandidates
                                ? jobData?.candidates || []
                                : (jobData?.candidates || []).slice(0, 10)
                            ).map((candidate) => (
                                <React.Fragment key={candidate.id}>
                                    <div className="text-gray-900">{candidate.name}</div>
                                    <div className="text-gray-400 text-right">{candidate.location}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <Link
                            href={`/resume?jobId=${id}`}
                            className="w-full bg-black text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition"
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Tambah Kandidat
                        </Link>
                    </div>
                </aside>
            </main>

            <footer className="w-full py-4 px-8 border-t bg-white text-xs text-gray-400 flex justify-between">
                <span>© 2024 Warkop. Semua hak cipta dilindungi.</span>
                <span>
                    <a href="#" className="hover:underline">Kebijakan Privasi</a> · <a href="#" className="hover:underline">Syarat & Ketentuan</a>
                </span>
            </footer>
        </div>
    );
} 