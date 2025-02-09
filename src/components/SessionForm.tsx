import React, { useState } from 'react';
import { SessionFormData, AvatarOption } from '../types';

const defaultAvatars: AvatarOption[] = [
  { id: 'Eric_public_pro2_20230608', label: 'Eric' },
  { id: 'Anna_public_3_20240108', label: 'Anna' }
];

const languages = ['English', 'Spanish', 'French', 'German'];

interface SessionFormProps {
  onSubmit: (data: SessionFormData) => void;
}

const SessionForm: React.FC<SessionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<SessionFormData>({
    knowledgeId: '',
    avatarId: '',
    language: 'English'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <label className="block text-white mb-2">Custom Knowledge ID (optional)</label>
        <input
          type="text"
          value={formData.knowledgeId}
          onChange={(e) => setFormData(prev => ({ ...prev, knowledgeId: e.target.value }))}
          placeholder="Enter a custom knowledge ID"
          className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-white mb-2">Custom Avatar ID (optional)</label>
        <input
          type="text"
          value={formData.avatarId}
          onChange={(e) => setFormData(prev => ({ ...prev, avatarId: e.target.value }))}
          placeholder="Enter a custom avatar ID"
          className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-blue-500 mb-2"
        />
        <div className="text-gray-400 text-sm mb-2">Or select one from these example avatars</div>
        <select
          onChange={(e) => setFormData(prev => ({ ...prev, avatarId: e.target.value }))}
          className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          <option value="">Select an avatar</option>
          {defaultAvatars.map(avatar => (
            <option key={avatar.id} value={avatar.id}>{avatar.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-white mb-2">Select language</label>
        <select
          value={formData.language}
          onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
          className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
      >
        Start session
      </button>
    </form>
  );
};

export default SessionForm;