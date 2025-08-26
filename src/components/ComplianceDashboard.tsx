'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface DeletionInfo {
  articlesCount: number;
  subscriptionsCount: number;
  ordersCount: number;
  deletionPolicy: {
    immediate: string[];
    anonymized: string[];
    retained: string[];
  };
}

export default function ComplianceDashboard() {
  const { data: session } = useSession();
  const t = useTranslations();
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (session) {
      loadDeletionInfo();
    }
  }, [session]);

  const loadDeletionInfo = async () => {
    try {
      const response = await fetch('/api/user/delete');
      const result = await response.json();
      if (result.success) {
        setDeletionInfo(result.data);
      }
    } catch (error) {
      console.error('Failed to load deletion info:', error);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/user/export');
      if (response.ok) {
        // Trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Data export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmDeletion: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Your account has been successfully deleted. You will be redirected to the home page.');
        window.location.href = '/';
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Account deletion failed:', error);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Data Rights</h2>
      
      <div className="space-y-6">
        {/* Data Export Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('profile.exportData')}
          </h3>
          <p className="text-gray-600 mb-4">
            Download all your personal data in JSON format. This includes your profile, articles, subscriptions, and order history.
          </p>
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export My Data
              </>
            )}
          </button>
        </div>

        {/* Account Deletion Section */}
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h3 className="text-lg font-medium text-red-900 mb-2">
            {t('profile.deleteAccount')}
          </h3>
          <p className="text-red-700 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          
          {deletionInfo && (
            <div className="mb-4 text-sm text-red-700">
              <p className="font-medium mb-2">This will delete:</p>
              <ul className="list-disc list-inside space-y-1 mb-3">
                <li>{deletionInfo.articlesCount} articles</li>
                <li>{deletionInfo.subscriptionsCount} subscriptions</li>
                <li>Your profile and account data</li>
              </ul>
              <p className="text-xs">
                Note: Order history will be anonymized for financial compliance, and some payment records may be retained for legal requirements.
              </p>
            </div>
          )}
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>
        </div>

        {/* Privacy Settings */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Privacy Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile Visibility</p>
                <p className="text-sm text-gray-600">Control who can see your profile</p>
              </div>
              <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                <option>Public</option>
                <option>Private</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-gray-600">Allow usage analytics collection</p>
              </div>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm">Enabled</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-900">Delete Account Confirmation</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                This action will permanently delete your account and cannot be undone. All your data will be removed from our systems.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Type <strong>DELETE MY ACCOUNT</strong> to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE MY ACCOUNT' || isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}