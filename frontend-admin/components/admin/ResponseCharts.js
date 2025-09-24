import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ResponseCharts = ({ responses, formFields }) => {
  const [statusData, setStatusData] = useState([]);
  const [fieldStats, setFieldStats] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [fieldOptions, setFieldOptions] = useState([]);

  useEffect(() => {
    if (responses && responses.length > 0) {
      // Generate status chart data
      const statusCounts = responses.reduce((acc, response) => {
        const status = response.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const statusChartData = Object.keys(statusCounts).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: statusCounts[key]
      }));

      setStatusData(statusChartData);

      // Generate field options for selection
      if (formFields && formFields.length > 0) {
        const options = formFields
          .filter(field => 
            ['select', 'radio', 'checkboxes', 'dropdown'].includes(field.type) ||
            (field.type === 'number' && field.settings?.min !== undefined && field.settings?.max !== undefined)
          )
          .map(field => ({
            id: field.id,
            label: field.label?.en || field.label || field.id
          }));
        
        setFieldOptions(options);
        if (options.length > 0) {
          setSelectedField(options[0].id);
        }
      }
    }
  }, [responses, formFields]);

  useEffect(() => {
    if (selectedField && responses && responses.length > 0) {
      generateFieldStats(selectedField);
    }
  }, [selectedField, responses]);

  const generateFieldStats = (fieldId) => {
    const field = formFields.find(f => f.id === fieldId);
    if (!field) return;

    let stats = [];
    
    if (['select', 'radio', 'dropdown'].includes(field.type)) {
      // For single-select fields
      const valueCounts = {};
      
      responses.forEach(response => {
        const answer = response.answers?.find(a => a.fieldId === fieldId);
        if (answer && answer.value) {
          valueCounts[answer.value] = (valueCounts[answer.value] || 0) + 1;
        }
      });
      
      stats = Object.keys(valueCounts).map(key => ({
        name: key,
        count: valueCounts[key]
      }));
    } 
    else if (field.type === 'checkboxes') {
      // For multi-select fields
      const valueCounts = {};
      
      responses.forEach(response => {
        const answer = response.answers?.find(a => a.fieldId === fieldId);
        if (answer && Array.isArray(answer.value)) {
          answer.value.forEach(val => {
            valueCounts[val] = (valueCounts[val] || 0) + 1;
          });
        }
      });
      
      stats = Object.keys(valueCounts).map(key => ({
        name: key,
        count: valueCounts[key]
      }));
    }
    else if (field.type === 'number' && field.settings?.min !== undefined && field.settings?.max !== undefined) {
      // For number fields with min/max, create range buckets
      const min = field.settings.min;
      const max = field.settings.max;
      const bucketCount = 5;
      const bucketSize = (max - min) / bucketCount;
      
      const buckets = Array(bucketCount).fill().map((_, i) => {
        const bucketMin = min + (i * bucketSize);
        const bucketMax = bucketMin + bucketSize;
        return {
          name: `${bucketMin.toFixed(0)}-${bucketMax.toFixed(0)}`,
          min: bucketMin,
          max: bucketMax,
          count: 0
        };
      });
      
      responses.forEach(response => {
        const answer = response.answers?.find(a => a.fieldId === fieldId);
        if (answer && !isNaN(Number(answer.value))) {
          const value = Number(answer.value);
          const bucket = buckets.find(b => value >= b.min && value < b.max);
          if (bucket) {
            bucket.count++;
          }
        }
      });
      
      stats = buckets;
    }
    
    setFieldStats(stats);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Response Analytics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Status Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Field Analysis Chart */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-700">Field Analysis</h4>
            {fieldOptions.length > 0 && (
              <select
                className="border border-gray-300 rounded-md text-sm p-2"
                value={selectedField || ''}
                onChange={(e) => setSelectedField(e.target.value)}
              >
                {fieldOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {fieldStats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={fieldStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {fieldOptions.length > 0 
                ? "No data available for selected field" 
                : "No suitable fields for analysis"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseCharts;