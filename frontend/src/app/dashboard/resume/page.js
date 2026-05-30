"use client";

import { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, TrendingUp, Briefcase, Award, Loader2, Star, ChevronRight } from 'lucide-react';
import styles from './resume.module.css';

export default function ResumeDashboard() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/resume/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch resume analytics", err);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Only PDF and DOCX files are supported.');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResumeData(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setResumeData(data.data.analysis);
        fetchAnalytics(); // Refresh analytics after successful upload
      } else {
        setError(data.error || 'Failed to process resume');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    }
    setUploading(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>Resume Intelligence</h1>
          <p className={styles.subtitle}>AI-Powered parsing, scoring, and auto-profiling</p>
        </div>

        {/* Analytics Top Bar */}
        {analytics && (
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <TrendingUp className={styles.analyticsIcon} size={20} color="#6366f1" />
              <div>
                <p className={styles.analyticsLabel}>Total Processed</p>
                <p className={styles.analyticsValue}>{analytics.totalUploads}</p>
              </div>
            </div>
            <div className={styles.analyticsCard}>
              <Star className={styles.analyticsIcon} size={20} color="#eab308" />
              <div>
                <p className={styles.analyticsLabel}>Average Score</p>
                <p className={styles.analyticsValue}>{analytics.averageScore}/100</p>
              </div>
            </div>
            <div className={styles.analyticsCard}>
              <Briefcase className={styles.analyticsIcon} size={20} color="#10b981" />
              <div>
                <p className={styles.analyticsLabel}>Top Skill</p>
                <p className={styles.analyticsValue}>
                  {analytics.topSkills && analytics.topSkills.length > 0 ? analytics.topSkills[0].name : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className={styles.uploadSection}>
          <div className={`${styles.uploadBox} ${file ? styles.uploadBoxActive : ''}`} onClick={triggerFileInput}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.doc,.docx" 
              style={{ display: 'none' }} 
            />
            {!file ? (
              <>
                <div className={styles.uploadIconWrap}>
                  <UploadCloud size={32} />
                </div>
                <h3 className={styles.uploadTitle}>Drag & Drop or Click to Upload</h3>
                <p className={styles.uploadDesc}>Supports PDF and DOCX (Max 10MB)</p>
              </>
            ) : (
              <>
                <div className={styles.uploadIconWrapSuccess}>
                  <FileText size={32} />
                </div>
                <h3 className={styles.uploadTitle}>{file.name}</h3>
                <p className={styles.uploadDesc}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </>
            )}
          </div>
          
          {error && <div className={styles.errorMsg}><AlertCircle size={16} /> {error}</div>}
          
          <button 
            className={styles.uploadBtn} 
            disabled={!file || uploading} 
            onClick={handleUpload}
          >
            {uploading ? (
              <><Loader2 size={18} className={styles.spinner} /> Processing via AI...</>
            ) : (
              <><UploadCloud size={18} /> Analyze Resume</>
            )}
          </button>
        </div>

        {/* Results Dashboard */}
        {resumeData && (
          <div className={styles.resultsGrid}>
            
            {/* Score & Summary */}
            <div className={styles.resultCardMain}>
              <div className={styles.scoreContainer}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreText}>{resumeData.score}</span>
                  <span className={styles.scoreMax}>/100</span>
                </div>
                <div>
                  <h3 className={styles.resultHeader}>Profile Strength</h3>
                  <p className={styles.levelBadge}>{resumeData.candidateLevel}</p>
                </div>
              </div>
              
              <div className={styles.divider}></div>
              
              <h4 className={styles.sectionTitle}>Recruiter Summary</h4>
              <p className={styles.summaryText}>{resumeData.summary}</p>
              
              <div className={styles.domainTag}>{resumeData.primaryDomain}</div>
            </div>

            {/* Extracted Details */}
            <div className={styles.detailsGrid}>
              
              {/* Skills */}
              <div className={styles.detailCard}>
                <h4 className={styles.sectionTitle}><CheckCircle size={16} color="#10b981" /> Extracted Skills</h4>
                <div className={styles.tagsContainer}>
                  {resumeData.skills?.map((skill, idx) => (
                    <span key={idx} className={styles.tag}>{skill}</span>
                  ))}
                </div>
              </div>

              {/* Experience & Education */}
              <div className={styles.detailCard}>
                <h4 className={styles.sectionTitle}><Briefcase size={16} color="#6366f1" /> Experience & Education</h4>
                <div className={styles.timeline}>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineDot}></div>
                    <div>
                      <p className={styles.timelineTitle}>{resumeData.experience} Years Experience</p>
                    </div>
                  </div>
                  {resumeData.education?.map((edu, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineDot}></div>
                      <div>
                        <p className={styles.timelineTitle}>{edu.degree}</p>
                        <p className={styles.timelineSub}>{edu.university} • {edu.graduationYear || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights (Missing & Strengths) */}
              <div className={`${styles.detailCard} ${styles.fullWidth}`}>
                <div className={styles.insightsGrid}>
                  <div>
                    <h4 className={styles.sectionTitle}><Award size={16} color="#eab308" /> Key Strengths</h4>
                    <ul className={styles.list}>
                      {resumeData.strengths?.map((s, idx) => (
                        <li key={idx} className={styles.listItem}><ChevronRight size={14} color="#64748b" /> {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className={styles.sectionTitle}><AlertCircle size={16} color="#f43f5e" /> Recommendations & Missing Data</h4>
                    <ul className={styles.list}>
                      {resumeData.improvementAreas?.map((i, idx) => (
                        <li key={idx} className={styles.listItem}><ChevronRight size={14} color="#64748b" /> {i}</li>
                      ))}
                      {resumeData.missingSections?.map((m, idx) => (
                        <li key={idx} className={styles.listItemError}><AlertCircle size={14} /> Missing: {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
