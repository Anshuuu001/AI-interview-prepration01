import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Check, Plus, Trash } from 'lucide-react';
import { getTranslation } from '../../utils/translations';

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [message, setMessage] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name, title, bio, skills });
    setMessage(getTranslation('profileUpdatedSuccessfully'));
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#10194A] dark:text-[#FAF5EF] font-editorial">VEYRA Career Profile</h2>
          <p className="text-xs text-[#666675] dark:text-[#C4C4D4]">Manage your candidate identity, target role, and technical skills for VEYRA AI.</p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <Check className="w-5 h-5" />
          {message}
        </div>
      )}

      <Card title={getTranslation('candidateInformation')} subtitle={getTranslation('candidateInformationDescription')}>
        <form onSubmit={handleSave} className="space-y-5">
          {/* Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#666675] dark:text-[#C4C4D4] uppercase tracking-wider mb-2">
                {getTranslation('fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF5EF]/60 dark:bg-slate-900/50 border border-[#E7E2DC] dark:border-slate-700 focus:border-[#10194A] dark:focus:border-[#E97878] focus:ring-1 focus:ring-[#10194A] dark:focus:ring-[#E97878] rounded-xl text-[#10194A] dark:text-[#FAF5EF] placeholder-[#666675]/60 dark:placeholder-slate-500 text-sm transition-all focus:outline-none"
                required
              />
            </div>

            {/* Target Job Title */}
            <div>
              <label className="block text-xs font-semibold text-[#666675] dark:text-[#C4C4D4] uppercase tracking-wider mb-2">
                {getTranslation('targetCareerTitle')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getTranslation('careerTitlePlaceholder')}
                className="w-full px-4 py-2.5 bg-[#FAF5EF]/60 dark:bg-slate-900/50 border border-[#E7E2DC] dark:border-slate-700 focus:border-[#10194A] dark:focus:border-[#E97878] focus:ring-1 focus:ring-[#10194A] dark:focus:ring-[#E97878] rounded-xl text-[#10194A] dark:text-[#FAF5EF] placeholder-[#666675]/60 dark:placeholder-slate-500 text-sm transition-all focus:outline-none"
              />
            </div>
          </div>

          {/* Professional Bio */}
          <div>
            <label className="block text-xs font-semibold text-[#666675] dark:text-[#C4C4D4] uppercase tracking-wider mb-2">
              {getTranslation('shortBio')}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={getTranslation('bioPlaceholder')}
              className="w-full px-4 py-2.5 bg-[#FAF5EF]/60 dark:bg-slate-900/50 border border-[#E7E2DC] dark:border-slate-700 focus:border-[#10194A] dark:focus:border-[#E97878] focus:ring-1 focus:ring-[#10194A] dark:focus:ring-[#E97878] rounded-xl text-[#10194A] dark:text-[#FAF5EF] placeholder-[#666675]/60 dark:placeholder-slate-500 text-sm transition-all focus:outline-none resize-none"
            />
          </div>

          {/* Skill Tag Editor */}
          <div>
            <label className="block text-xs font-semibold text-[#666675] dark:text-[#C4C4D4] uppercase tracking-wider mb-2">
              {getTranslation('technicalSkillsets')}
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder={getTranslation('skillsetPlaceholder')}
                className="flex-1 px-4 py-2 bg-[#FAF5EF]/60 dark:bg-slate-900/50 border border-[#E7E2DC] dark:border-slate-700 focus:border-[#10194A] dark:focus:border-[#E97878] focus:ring-1 focus:ring-[#10194A] dark:focus:ring-[#E97878] rounded-xl text-[#10194A] dark:text-[#FAF5EF] placeholder-[#666675]/60 dark:placeholder-slate-500 text-sm transition-all focus:outline-none"
              />
              <Button onClick={handleAddSkill} variant="secondary" icon={Plus} size="sm">
                {getTranslation('addTag')}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <span className="text-xs text-[#666675] dark:text-slate-400 italic">{getTranslation('noSkillsAdded')}</span>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF5EF] dark:bg-white/5 text-[#10194A] dark:text-[#FAF5EF] border border-[#E7E2DC] dark:border-white/10 text-xs font-medium transition-all hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 dark:hover:text-rose-400 group/tag"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#666675] dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E2DC] dark:border-white/10 flex justify-end">
            <Button type="submit" variant="primary" icon={Check}>
              {getTranslation('saveUpdates')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile;
