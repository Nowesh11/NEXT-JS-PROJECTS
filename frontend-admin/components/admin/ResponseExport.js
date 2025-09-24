import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';

const ResponseExport = ({ responses, formFields, formTitle }) => {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = async () => {
    if (!responses || responses.length === 0) {
      alert('No responses to export');
      return;
    }

    setExporting(true);

    try {
      // Prepare CSV headers
      const headers = ['Response ID', 'Submitted At', 'Status', 'User Name', 'User Email'];
      
      // Add all form field headers
      const fieldHeaders = formFields.map(field => field.label?.en || field.label || field.id);
      
      // Combine all headers
      const allHeaders = [...headers, ...fieldHeaders];
      
      // Prepare CSV rows
      const rows = responses.map(response => {
        // Basic response data
        const basicData = [
          response._id,
          new Date(response.submittedAt).toLocaleString(),
          response.status,
          response.userName,
          response.userEmail
        ];
        
        // Add answers for each field
        const fieldData = formFields.map(field => {
          const answer = response.answers?.find(a => a.fieldId === field.id);
          if (!answer) return '';
          
          // Format the answer based on field type
          if (Array.isArray(answer.value)) {
            return answer.value.join(', ');
          } else if (typeof answer.value === 'object' && answer.value !== null) {
            return JSON.stringify(answer.value);
          } else {
            return answer.value || '';
          }
        });
        
        return [...basicData, ...fieldData];
      });
      
      // Convert to CSV format
      const csvContent = [
        allHeaders.join(','),
        ...rows.map(row => row.map(cell => {
          // Escape commas and quotes in cell values
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
      ].join('\n');
      
      // Create a Blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${formTitle || 'form'}_responses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Alternative approach using API
      /*
      const response = await fetch('/api/form-responses/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: responses[0].formId,
          format: 'csv'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export responses');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${formTitle || 'form'}_responses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      */
    } catch (error) {
      console.error('Error exporting responses:', error);
      alert('Failed to export responses');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={exportToCSV}
        disabled={exporting || !responses || responses.length === 0}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
      >
        {exporting ? (
          <>
            <FileText className="mr-2 h-4 w-4 animate-pulse" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </>
        )}
      </button>
    </div>
  );
};

export default ResponseExport;