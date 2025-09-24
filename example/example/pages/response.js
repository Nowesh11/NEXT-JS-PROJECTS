import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';

export default function ResponseAnalytics() {
    const router = useRouter();
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('en');
    const [formData, setFormData] = useState(null);
    const [responseData, setResponseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartsRef = useRef({});

    // Initialize theme and language from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const savedLanguage = localStorage.getItem('language') || 'en';
        setTheme(savedTheme);
        setLanguage(savedLanguage);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    // Load form data and responses
    useEffect(() => {
        loadFormData();
    }, [router.query]);

    const loadFormData = async () => {
        try {
            setLoading(true);
            const formId = router.query.id || router.query.formId;
            
            if (!formId) {
                setError('Form ID not provided');
                return;
            }

            // Fetch form configuration
            const formResponse = await fetch(`/api/forms/${formId}`);
            if (!formResponse.ok) throw new Error('Failed to fetch form data');
            const form = await formResponse.json();

            // Fetch form responses
            const responsesResponse = await fetch(`/api/forms/${formId}/responses`);
            if (!responsesResponse.ok) throw new Error('Failed to fetch responses');
            const responses = await responsesResponse.json();

            setFormData(form);
            setResponseData(responses);
            setError(null);
        } catch (err) {
            console.error('Error loading form data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleLanguage = () => {
        const newLanguage = language === 'en' ? 'ta' : 'en';
        setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    const getText = (key) => {
        const texts = {
            en: {
                title: 'Form Response Analytics',
                subtitle: 'Comprehensive analysis of form submissions with interactive charts and export capabilities',
                totalResponses: 'Total Responses',
                formName: 'Form Name',
                createdDate: 'Created Date',
                lastResponse: 'Last Response',
                exportCSV: 'Export CSV',
                exportTrend: 'Export Trend',
                exportDetailed: 'Export Detailed',
                noData: 'No Data Available',
                noResponses: 'No responses for this question',
                loading: 'Loading analytics...',
                error: 'Error loading data',
                responses: 'responses',
                backToForms: 'Back to Forms',
                chartTypes: {
                    smartText: 'Smart Text Analysis',
                    wordCloud: 'Word Cloud',
                    smartChoice: 'Smart Choice Chart',
                    horizontalBar: 'Horizontal Bar',
                    histogram: 'Histogram + Stats',
                    smallMultiples: 'Small Multiples',
                    timeSeries: 'Time Series',
                    circularHistogram: 'Circular Histogram',
                    fileAnalysis: 'File Analysis',
                    domainAnalysis: 'Domain Analysis',
                    geographicAnalysis: 'Geographic Analysis',
                    responseList: 'Response List'
                }
            },
            ta: {
                title: 'படிவ பதில் பகுப்பாய்வு',
                subtitle: 'ஊடாடும் விளக்கப்படங்கள் மற்றும் ஏற்றுமதி திறன்களுடன் படிவ சமர்ப்பிப்புகளின் விரிவான பகுப்பாய்வு',
                totalResponses: 'மொத்த பதில்கள்',
                formName: 'படிவ பெயர்',
                createdDate: 'உருவாக்கப்பட்ட தேதி',
                lastResponse: 'கடைசி பதில்',
                exportCSV: 'CSV ஏற்றுமதி',
                exportTrend: 'போக்கு ஏற்றுமதி',
                exportDetailed: 'விரிவான ஏற்றுமதி',
                noData: 'தரவு இல்லை',
                noResponses: 'இந்த கேள்விக்கு பதில்கள் இல்லை',
                loading: 'பகுப்பாய்வு ஏற்றுகிறது...',
                error: 'தரவு ஏற்றுவதில் பிழை',
                responses: 'பதில்கள்',
                backToForms: 'படிவங்களுக்கு திரும்பு',
                chartTypes: {
                    smartText: 'ஸ்மார்ட் உரை பகுப்பாய்வு',
                    wordCloud: 'வார்த்தை மேகம்',
                    smartChoice: 'ஸ்மார்ட் தேர்வு விளக்கப்படம்',
                    horizontalBar: 'கிடைமட்ட பட்டி',
                    histogram: 'ஹிஸ்டோகிராம் + புள்ளிவிவரங்கள்',
                    smallMultiples: 'சிறிய பல',
                    timeSeries: 'நேர தொடர்',
                    circularHistogram: 'வட்ட ஹிஸ்டோகிராம்',
                    fileAnalysis: 'கோப்பு பகுப்பாய்வு',
                    domainAnalysis: 'டொமைன் பகுப்பாய்வு',
                    geographicAnalysis: 'புவியியல் பகுப்பாய்வு',
                    responseList: 'பதில் பட்டியல்'
                }
            }
        };
        return texts[language][key] || key;
    };

    const exportCSV = () => {
        if (!responseData || responseData.length === 0) {
            alert(getText('noData'));
            return;
        }

        const headers = ['Response ID', 'Submitted At', 'IP Address', 'User Agent'];
        if (formData?.fields) {
            formData.fields.forEach(field => {
                headers.push(field.label || field.name);
            });
        }

        const csvContent = [headers.join(',')];

        responseData.forEach(response => {
            const baseData = [
                response._id || '',
                response.submittedAt || '',
                response.ipAddress || '',
                response.userAgent || ''
            ].map(value => `"${value.toString().replace(/"/g, '""')}"`);

            const fieldData = formData?.fields?.map(field => {
                const value = response.data?.[field.name] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }) || [];

            const row = [...baseData, ...fieldData];
            csvContent.push(row.join(','));
        });

        // Add summary statistics
        csvContent.push('', 'Summary Statistics');
        csvContent.push(`Total Responses,${responseData.length}`);
        csvContent.push(`Export Date,"${new Date().toISOString()}"`); 
        csvContent.push(`Form Name,"${formData?.name || 'Unnamed Form'}"`); 

        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form-responses-${formData?.name || 'data'}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportTrend = () => {
        if (!responseData || responseData.length === 0) {
            alert(getText('noData'));
            return;
        }

        const trendData = {};
        const hourlyData = {};
        const dailyData = {};

        responseData.forEach(response => {
            const date = new Date(response.submittedAt || Date.now());
            const dateStr = date.toDateString();
            const hour = date.getHours();
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

            trendData[dateStr] = (trendData[dateStr] || 0) + 1;
            hourlyData[hour] = (hourlyData[hour] || 0) + 1;
            dailyData[dayOfWeek] = (dailyData[dayOfWeek] || 0) + 1;
        });

        const headers = ['Date', 'Response Count', 'Day of Week', 'Cumulative'];
        const csvContent = [headers.join(',')];

        let cumulative = 0;
        Object.entries(trendData).sort((a, b) => new Date(a[0]) - new Date(b[0])).forEach(([date, count]) => {
            cumulative += count;
            const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            csvContent.push(`"${date}",${count},"${dayOfWeek}",${cumulative}`);
        });

        // Add hourly breakdown
        csvContent.push('', 'Hourly Breakdown', 'Hour,Response Count');
        for (let i = 0; i < 24; i++) {
            csvContent.push(`${i}:00,${hourlyData[i] || 0}`);
        }

        // Add daily breakdown
        csvContent.push('', 'Daily Breakdown', 'Day,Response Count');
        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        daysOrder.forEach(day => {
            csvContent.push(`"${day}",${dailyData[day] || 0}`);
        });

        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form-trend-analysis-${formData?.name || 'data'}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{getText('loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>{getText('error')}</h3>
                <p>{error}</p>
                <Link href="/forms" className="btn btn-primary">
                    {getText('backToForms')}
                </Link>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{getText('title')} - Tamil Language Society</title>
                <meta name="description" content={getText('subtitle')} />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
                <script src="https://cdn.jsdelivr.net/npm/wordcloud@1.2.2/src/wordcloud2.js"></script>
            </Head>

            {/* Theme Toggle Button */}
            <button className="theme-toggle" onClick={toggleTheme}>
                <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
            </button>

            {/* Language Toggle Button */}
            <button className="language-toggle" onClick={toggleLanguage}>
                <i className="fas fa-language"></i>
                <span>{language === 'en' ? 'தமிழ்' : 'EN'}</span>
            </button>

            <Navigation />

            <div className="container">
                {/* Header */}
                <div className="response-header">
                    <h1>{getText('title')}</h1>
                    <p>{getText('subtitle')}</p>
                    
                    <div className="form-info">
                        <div className="info-item">
                            <i className="fas fa-file-alt"></i>
                            <span><strong>{getText('formName')}:</strong> {formData?.name || 'Unnamed Form'}</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-chart-bar"></i>
                            <span><strong>{getText('totalResponses')}:</strong> {responseData?.length || 0}</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-calendar"></i>
                            <span><strong>{getText('createdDate')}:</strong> {formData?.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-clock"></i>
                            <span><strong>{getText('lastResponse')}:</strong> {responseData?.length > 0 ? new Date(responseData[responseData.length - 1]?.submittedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Export Actions */}
                <div className="export-actions">
                    <button className="btn btn-primary" onClick={exportCSV}>
                        <i className="fas fa-download"></i>
                        {getText('exportCSV')}
                    </button>
                    <button className="btn btn-success" onClick={exportTrend}>
                        <i className="fas fa-chart-line"></i>
                        {getText('exportTrend')}
                    </button>
                    <Link href={`/forms/${router.query.id || router.query.formId}`} className="btn btn-info">
                        <i className="fas fa-arrow-left"></i>
                        {getText('backToForms')}
                    </Link>
                </div>

                {/* Charts Container */}
                <div className="charts-container" id="charts-container">
                    {formData?.fields && formData.fields.length > 0 ? (
                        formData.fields.map((field, index) => (
                            <ChartCard 
                                key={field.name || index}
                                field={field}
                                responseData={responseData}
                                index={index}
                                getText={getText}
                            />
                        ))
                    ) : (
                        <div className="no-data">
                            <i className="fas fa-inbox"></i>
                            <h3>{getText('noData')}</h3>
                            <p>{getText('noResponses')}</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                /* Theme Variables */
                :root {
                    /* Light Theme (Default) */
                    --bg-primary: #FFFEFF;
                    --bg-secondary: #F2F2F2;
                    --bg-gradient: linear-gradient(135deg, #F2F2F2 0%, #FFFEFF 100%);
                    --bg-gradient-accent: linear-gradient(135deg, #2F3E75 0%, #A83232 100%);
                    --bg-gradient-secondary: linear-gradient(135deg, #0D0D0D 0%, #182657 100%);
                    
                    --text-primary: #0D0D0D;
                    --text-secondary: #2F3E75;
                    --text-muted: #CFD0D0;
                    --text-accent: #A83232;
                    --text-inverse: #FFFEFF;
                    
                    --border-color: rgba(47, 62, 117, 0.2);
                    --shadow-sm: 0 2px 4px rgba(47, 62, 117, 0.1);
                    --shadow-md: 0 4px 12px rgba(47, 62, 117, 0.15);
                    --shadow-lg: 0 8px 24px rgba(47, 62, 117, 0.2);
                    
                    --overlay-light: rgba(255, 254, 255, 0.9);
                    --overlay-dark: rgba(47, 62, 117, 0.1);
                    
                    --glass-bg: rgba(255, 254, 255, 0.8);
                    --glass-border: rgba(47, 62, 117, 0.2);
                    
                    --transition: all 0.3s ease-in-out;
                    --glow-primary: 0 0 12px rgba(168, 50, 50, 0.4);
                    --glow-secondary: 0 0 8px rgba(47, 62, 117, 0.3);
                    
                    --status-success: #22c55e;
                    --status-warning: #f59e0b;
                    --status-error: #ef4444;
                    --status-info: #3b82f6;
                    
                    --light-tertiary: #FFFEFF;
                    --dark-tertiary: #EDEFEE;
                }
                
                [data-theme="dark"] {
                    /* Dark Theme */
                    --bg-primary: #182657;
                    --bg-secondary: #0D0D0D;
                    --bg-gradient: linear-gradient(135deg, #0D0D0D 0%, #182657 100%);
                    --bg-gradient-accent: linear-gradient(135deg, #7A1515 0%, #EDEFEE 100%);
                    --bg-gradient-secondary: linear-gradient(135deg, #0D0D0D 0%, #182657 100%);
                    
                    --text-primary: #EDEFEE;
                    --text-secondary: #AEAEAE;
                    --text-muted: #7A1515;
                    --text-accent: #7A1515;
                    --text-inverse: #0D0D0D;
                    
                    --border-color: rgba(174, 174, 174, 0.3);
                    --shadow-sm: 0 2px 4px rgba(174, 174, 174, 0.1);
                    --shadow-md: 0 4px 12px rgba(174, 174, 174, 0.2);
                    --shadow-lg: 0 8px 24px rgba(174, 174, 174, 0.3);
                    
                    --overlay-light: rgba(24, 38, 87, 0.9);
                    --overlay-dark: rgba(174, 174, 174, 0.1);
                    
                    --glass-bg: rgba(24, 38, 87, 0.8);
                    --glass-border: rgba(174, 174, 174, 0.3);
                    
                    --glow-primary: 0 0 12px rgba(237, 239, 238, 0.4);
                    --glow-secondary: 0 0 8px rgba(174, 174, 174, 0.3);
                    
                    --light-tertiary: #EDEFEE;
                    --dark-tertiary: #EDEFEE;
                }

                /* Theme Toggle Button */
                .theme-toggle {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                    background: var(--bg-gradient-accent);
                    border: none;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: var(--transition);
                    box-shadow: var(--shadow-md);
                    color: var(--light-tertiary);
                }

                .theme-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: var(--glow-primary);
                }

                /* Language Toggle Button */
                .language-toggle {
                    position: fixed;
                    top: 20px;
                    right: 80px;
                    z-index: 1000;
                    background: var(--bg-gradient-accent);
                    border: none;
                    border-radius: 25px;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: var(--transition);
                    box-shadow: var(--shadow-md);
                    color: var(--light-tertiary);
                    font-size: 14px;
                    font-weight: 500;
                }

                .language-toggle:hover {
                    transform: scale(1.05);
                    box-shadow: var(--glow-primary);
                }

                /* Body and base styles */
                body {
                    background: var(--bg-gradient);
                    color: var(--text-primary);
                    transition: var(--transition);
                    font-family: 'Poppins', sans-serif;
                    line-height: 1.6;
                    min-height: 100vh;
                }

                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                /* Header Styles */
                .response-header {
                    background: var(--glass-bg);
                    border-radius: 1rem;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: var(--shadow-lg);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--border-color);
                }

                .response-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    background: var(--bg-gradient-accent);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .response-header p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }

                .form-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                }

                .info-item i {
                    color: var(--text-accent);
                }

                /* Export Actions */
                .export-actions {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    font-size: 0.95rem;
                }

                .btn-primary {
                    background: var(--bg-gradient-accent);
                    color: var(--light-tertiary);
                }

                .btn-success {
                    background: var(--status-success);
                    color: var(--light-tertiary);
                }

                .btn-info {
                    background: var(--status-info);
                    color: var(--light-tertiary);
                }

                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }

                /* Charts Container */
                .charts-container {
                    display: grid;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                /* Loading and Error States */
                .loading-container, .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 50vh;
                    text-align: center;
                    color: var(--text-secondary);
                }

                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid var(--border-color);
                    border-top: 4px solid var(--text-accent);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error-container i {
                    font-size: 3rem;
                    color: var(--status-error);
                    margin-bottom: 1rem;
                }

                .no-data {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    text-align: center;
                    color: var(--text-secondary);
                    background: var(--glass-bg);
                    border-radius: 1rem;
                    border: 1px solid var(--border-color);
                }

                .no-data i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .container {
                        padding: 1rem;
                    }

                    .response-header h1 {
                        font-size: 2rem;
                    }

                    .form-info {
                        grid-template-columns: 1fr;
                    }

                    .export-actions {
                        flex-direction: column;
                    }

                    .theme-toggle, .language-toggle {
                        top: 10px;
                    }

                    .language-toggle {
                        right: 70px;
                    }
                }
            `}</style>
        </>
    );
}

// Chart Card Component
function ChartCard({ field, responseData, index, getText }) {
    const canvasRef = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);

    useEffect(() => {
        if (canvasRef.current && responseData) {
            generateChart();
        }

        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [field, responseData]);

    const generateChart = () => {
        const responses = responseData
            .map(response => response.data?.[field.name])
            .filter(value => value !== undefined && value !== null && value !== '');

        if (responses.length === 0) {
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        
        // Destroy existing chart
        if (chartInstance) {
            chartInstance.destroy();
        }

        let newChart;
        
        // Smart chart selection based on field type
        switch (field.type) {
            case 'multiple-choice':
            case 'dropdown':
            case 'radio':
            case 'select':
                newChart = createChoiceChart(ctx, responses);
                break;
            case 'checkboxes':
            case 'checkbox':
                newChart = createBarChart(ctx, responses);
                break;
            case 'linear-scale':
            case 'number':
            case 'rating':
                newChart = createHistogram(ctx, responses);
                break;
            default:
                newChart = createTextAnalysis(ctx, responses);
                break;
        }

        setChartInstance(newChart);
    };

    const createChoiceChart = (ctx, responses) => {
        const counts = {};
        responses.forEach(response => {
            counts[response] = (counts[response] || 0) + 1;
        });

        const labels = Object.keys(counts);
        const data = Object.values(counts);
        const total = data.reduce((a, b) => a + b, 0);

        return new Chart(ctx, {
            type: labels.length <= 6 ? 'doughnut' : 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
                        '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: labels.length <= 6 ? 'right' : 'top',
                        labels: {
                            color: 'var(--text-primary)',
                            generateLabels: function(chart) {
                                const data = chart.data;
                                return data.labels.map((label, i) => {
                                    const count = data.datasets[0].data[i];
                                    const percentage = ((count / total) * 100).toFixed(1);
                                    return {
                                        text: `${label} (${count}, ${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i]
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} responses (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: labels.length > 6 ? {
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'var(--text-secondary)' }
                    },
                    x: {
                        ticks: { color: 'var(--text-secondary)' }
                    }
                } : {}
            }
        });
    };

    const createBarChart = (ctx, responses) => {
        const counts = {};
        responses.forEach(response => {
            if (Array.isArray(response)) {
                response.forEach(item => {
                    counts[item] = (counts[item] || 0) + 1;
                });
            } else {
                counts[response] = (counts[response] || 0) + 1;
            }
        });

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: 'Responses',
                    data: Object.values(counts),
                    backgroundColor: '#2ca02c',
                    borderColor: '#2ca02c',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.x} responses`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: 'var(--text-secondary)' }
                    },
                    y: {
                        ticks: { color: 'var(--text-secondary)' }
                    }
                }
            }
        });
    };

    const createHistogram = (ctx, responses) => {
        const numericValues = responses
            .map(r => parseFloat(r))
            .filter(n => !isNaN(n));

        if (numericValues.length === 0) {
            return null;
        }

        const sorted = numericValues.sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const binCount = Math.min(10, Math.ceil(Math.sqrt(numericValues.length)));
        const binWidth = (max - min) / binCount;
        const bins = Array(binCount).fill(0);
        const binLabels = [];

        for (let i = 0; i < binCount; i++) {
            const binStart = min + i * binWidth;
            const binEnd = min + (i + 1) * binWidth;
            binLabels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
        }

        numericValues.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
            bins[binIndex]++;
        });

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: binLabels,
                datasets: [{
                    label: 'Frequency',
                    data: bins,
                    backgroundColor: '#9467bd',
                    borderColor: '#9467bd',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Frequency' },
                        ticks: { color: 'var(--text-secondary)' }
                    },
                    x: {
                        title: { display: true, text: field.label || 'Value Range' },
                        ticks: { color: 'var(--text-secondary)' }
                    }
                }
            }
        });
    };

    const createTextAnalysis = (ctx, responses) => {
        // Simple word frequency analysis
        const wordFreq = {};
        responses.forEach(response => {
            const words = String(response).toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 2) {
                    wordFreq[word] = (wordFreq[word] || 0) + 1;
                }
            });
        });

        const topWords = Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        if (topWords.length === 0) {
            return null;
        }

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topWords.map(([word]) => word),
                datasets: [{
                    label: 'Frequency',
                    data: topWords.map(([, count]) => count),
                    backgroundColor: '#ff7f0e',
                    borderColor: '#ff7f0e',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: 'var(--text-secondary)' }
                    },
                    y: {
                        ticks: { color: 'var(--text-secondary)' }
                    }
                }
            }
        });
    };

    const responses = responseData
        .map(response => response.data?.[field.name])
        .filter(value => value !== undefined && value !== null && value !== '');

    const getChartType = (fieldType) => {
        const mapping = {
            'multiple-choice': getText('chartTypes.smartChoice'),
            'dropdown': getText('chartTypes.smartChoice'),
            'radio': getText('chartTypes.smartChoice'),
            'select': getText('chartTypes.smartChoice'),
            'checkboxes': getText('chartTypes.horizontalBar'),
            'checkbox': getText('chartTypes.horizontalBar'),
            'linear-scale': getText('chartTypes.histogram'),
            'number': getText('chartTypes.histogram'),
            'rating': getText('chartTypes.histogram'),
            'text': getText('chartTypes.smartText'),
            'textarea': getText('chartTypes.wordCloud'),
            'paragraph': getText('chartTypes.wordCloud')
        };
        return mapping[fieldType] || getText('chartTypes.responseList');
    };

    return (
        <div className="chart-card">
            <div className="chart-header">
                <h3>{field.label || field.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {field.type} • {getChartType(field.type)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {responses.length} {getText('responses')}
                    </span>
                </div>
            </div>
            
            <div className="chart-content">
                {responses.length === 0 ? (
                    <div className="no-data">
                        <i className="fas fa-inbox"></i>
                        <h3>{getText('noData')}</h3>
                        <p>{getText('noResponses')}</p>
                    </div>
                ) : (
                    <div className="chart-wrapper">
                        <canvas ref={canvasRef} style={{ maxHeight: '400px' }}></canvas>
                    </div>
                )}
            </div>

            <style jsx>{`
                .chart-card {
                    background: var(--glass-bg);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: var(--shadow-md);
                    border: 1px solid var(--border-color);
                    transition: var(--transition);
                }

                .chart-card:hover {
                    box-shadow: var(--shadow-lg);
                }

                .chart-header h3 {
                    margin: 0 0 0.5rem 0;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .chart-content {
                    margin-top: 1rem;
                }

                .chart-wrapper {
                    position: relative;
                    height: 400px;
                }

                .no-data {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    text-align: center;
                    color: var(--text-secondary);
                }

                .no-data i {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }
            `}</style>
        </div>
    );
}