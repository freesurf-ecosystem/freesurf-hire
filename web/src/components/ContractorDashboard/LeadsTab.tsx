import React, { useState } from 'react';
import { FileText, Mail, Phone, MapPin } from 'lucide-react';

interface LeadsTabProps {
  requests: any[];
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  viewed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  responded: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'new':
      return 'New';
    case 'viewed':
      return 'Viewed';
    case 'responded':
      return 'Responded';
    case 'closed':
      return 'Closed';
    default:
      return status || 'New';
  }
};

export default function LeadsTab({ requests }: LeadsTabProps) {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const truncate = (text: string, limit = 150) => {
    const value = String(text || '').trim();
    const words = value.split(/\s+/);
    if (words.length <= limit) return { text: value, truncated: false };
    return { text: words.slice(0, limit).join(' '), truncated: true };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Requests</h2>
      <p className="text-gray-600 mb-6">
        Clients who contacted you directly through FreeSurf. Support can review these if there is an issue
        with a request.
      </p>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
          <p className="text-gray-600">When a client sends you a request it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => {
            const clientName = request.client_name || 'Client';
            const email = request.client_email;
            const phone = request.client_phone;
            const service = request.service_slug || 'Service not specified';
            const zip = request.zip_code || '';
            const message = request.message || '';
            const body = truncate(message);

            return (
              <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{clientName}</h3>
                    <p className="text-sm text-gray-600">{service}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      STATUS_STYLES[request.status] || STATUS_STYLES.new
                    }`}
                  >
                    {statusLabel(request.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {email ? (
                      <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800">
                        {email}
                      </a>
                    ) : (
                      'Email not provided'
                    )}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {phone ? (
                      <a href={`tel:${phone}`} className="text-blue-600 hover:text-blue-800">
                        {phone}
                      </a>
                    ) : (
                      'Phone not provided'
                    )}
                  </p>
                  {zip && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {zip}
                    </p>
                  )}
                </div>

                {message && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {expanded[request.id] ? message : body.text + (body.truncated ? '...' : '')}
                    </p>
                    {body.truncated && (
                      <button
                        onClick={() => setExpanded((prev) => ({ ...prev, [request.id]: !prev[request.id] }))}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium underline mt-2"
                      >
                        {expanded[request.id] ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                )}

                <div className="text-sm">
                  <span className="text-gray-500">Received: </span>
                  <span className="font-medium">{new Date(request.created_at).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
