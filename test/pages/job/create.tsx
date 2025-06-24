import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from '../../services/authService';
import { API_ENDPOINTS } from '../../config/api';

interface JobFormData {
    title: string;
    location: string;
    teamDescription: string;
    jobDescription: string;
    responsibilities: string[];
    recruitmentTeam: {
        teamName: string;
        manager: string;
        interviewers: Array<{
            name: string;
            department: string;
        }>;
    };
}

const PostNewJobPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<JobFormData>({
        title: "",
        location: "",
        teamDescription: "",
        jobDescription: "",
        responsibilities: [""],
        recruitmentTeam: {
            teamName: "",
            manager: "",
            interviewers: [{ name: "", department: "" }]
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            // First, create the job
            const jobResponse = await fetch(API_ENDPOINTS.jobs, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    location: formData.location,
                    teamDescription: formData.teamDescription,
                    jobDescription: formData.jobDescription,
                    responsibilities: formData.responsibilities,
                    recruitmentTeam: {
                        teamName: formData.recruitmentTeam.teamName,
                        manager: formData.recruitmentTeam.manager,
                    }
                }),
            });

            if (!jobResponse.ok) {
                throw new Error('Failed to create job');
            }

            const jobData = await jobResponse.json();

            // Then, create the interviewers
            const interviewerPromises = formData.recruitmentTeam.interviewers.map(interviewer =>
                fetch(API_ENDPOINTS.interviewers, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        jobId: jobData.id,
                        name: interviewer.name,
                        department: interviewer.department,
                    }),
                })
            );

            // Wait for all interviewer creation requests to complete
            const interviewerResponses = await Promise.all(interviewerPromises);

            // Check if any interviewer creation failed
            const failedInterviewers = interviewerResponses.filter(response => !response.ok);
            if (failedInterviewers.length > 0) {
                throw new Error('Failed to create some interviewers');
            }

            // Only redirect after all operations are successful
            await router.push("/dashboard");
        } catch (error) {
            console.error("Error creating job:", error);
            setError(error instanceof Error ? error.message : 'An error occurred while creating the job');
        } finally {
            setIsLoading(false);
        }
    };

    const addResponsibility = () => {
        setFormData(prev => ({
            ...prev,
            responsibilities: [...prev.responsibilities, ""]
        }));
    };

    const updateResponsibility = (index: number, value: string) => {
        const newResponsibilities = [...formData.responsibilities];
        newResponsibilities[index] = value;
        setFormData(prev => ({
            ...prev,
            responsibilities: newResponsibilities
        }));
    };

    const addInterviewer = () => {
        setFormData(prev => ({
            ...prev,
            recruitmentTeam: {
                ...prev.recruitmentTeam,
                interviewers: [...prev.recruitmentTeam.interviewers, { name: "", department: "" }]
            }
        }));
    };

    const updateInterviewer = (index: number, field: "name" | "department", value: string) => {
        const newInterviewers = [...formData.recruitmentTeam.interviewers];
        newInterviewers[index] = { ...newInterviewers[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            recruitmentTeam: {
                ...prev.recruitmentTeam,
                interviewers: newInterviewers
            }
        }));
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <main className="max-w-4xl mx-auto px-8 py-8">
                <h1 className="text-3xl font-bold mb-8">Buat Lowongan Baru</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="font-bold text-lg mb-4">Informasi Dasar</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Pekerjaan</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="font-bold text-lg mb-4">Deskripsi</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Tim</label>
                                <textarea
                                    value={formData.teamDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, teamDescription: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Pekerjaan</label>
                                <textarea
                                    value={formData.jobDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="font-bold text-lg mb-4">Tanggung Jawab</h2>
                        {formData.responsibilities.map((responsibility, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={responsibility}
                                    onChange={(e) => updateResponsibility(idx, e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {formData.responsibilities.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            responsibilities: prev.responsibilities.filter((_, i) => i !== idx)
                                        }))}
                                        className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addResponsibility}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Tambah Tanggung Jawab
                        </button>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="font-bold text-lg mb-4">Tim Rekrutmen</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tim</label>
                                <input
                                    type="text"
                                    value={formData.recruitmentTeam.teamName}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        recruitmentTeam: {
                                            ...prev.recruitmentTeam,
                                            teamName: e.target.value
                                        }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                                <input
                                    type="text"
                                    value={formData.recruitmentTeam.manager}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        recruitmentTeam: {
                                            ...prev.recruitmentTeam,
                                            manager: e.target.value
                                        }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Interviewers</h3>
                            {formData.recruitmentTeam.interviewers.map((interviewer, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Nama Interviewer"
                                        value={interviewer.name}
                                        onChange={(e) => updateInterviewer(idx, "name", e.target.value)}
                                        className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Departemen"
                                        value={interviewer.department}
                                        onChange={(e) => updateInterviewer(idx, "department", e.target.value)}
                                        className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {formData.recruitmentTeam.interviewers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                recruitmentTeam: {
                                                    ...prev.recruitmentTeam,
                                                    interviewers: prev.recruitmentTeam.interviewers.filter((_, i) => i !== idx)
                                                }
                                            }))}
                                            className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addInterviewer}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Tambah Interviewer
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan Lowongan'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default PostNewJobPage; 