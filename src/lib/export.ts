import { BusinessLead } from './types';

export function exportLeadsToCSV(leads: BusinessLead[]) {
  const headers = [
    'Business Name',
    'Category',
    'Location',
    'Phone',
    'Address',
    'Website',
    'Google Rating',
    'Review Count',
    'Lead Score',
    'Status'
  ];

  const rows = leads.map(lead => [
    `"${lead.name.replace(/"/g, '""')}"`,
    `"${lead.category}"`,
    `"${lead.location}"`,
    `"${lead.phone}"`,
    `"${lead.address.replace(/"/g, '""')}"`,
    `"${lead.websiteUrl || 'No Website'}"`,
    lead.rating,
    lead.reviewCount,
    lead.score,
    `"${lead.status}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
