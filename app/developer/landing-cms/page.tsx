'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, Eye, Save, X, Plus, GripVertical } from 'lucide-react';
import '../../globals.css';
import styles from './LandingCMS.module.css';

interface Logo {
  id: string;
  name: string;
  url: string;
  image: string;
}

export default function LandingCMSPage() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    image: ''
  });

  // Load CMS data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/developer/landing-cms');
      const result = await response.json();
      if (result.success) {
        setLogos(result.data.logos || []);
      }
    } catch (error) {
      console.error('Failed to load CMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/developer/landing-cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logos })
      });
      const result = await response.json();
      if (result.success) {
        alert('✅ Changes saved successfully!');
      } else {
        alert('❌ Failed to save changes');
      }
    } catch (error) {
      console.error('Failed to save CMS data:', error);
      alert('❌ Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLogo = () => {
    if (!formData.name || !formData.url || !formData.image) {
      alert('Please fill all fields');
      return;
    }

    const newLogo: Logo = {
      id: Date.now().toString(),
      ...formData
    };

    setLogos([...logos, newLogo]);
    setFormData({ name: '', url: '', image: '' });
    setShowAddForm(false);
  };

  const handleEditLogo = (id: string) => {
    const logo = logos.find(l => l.id === id);
    if (logo) {
      setFormData({ name: logo.name, url: logo.url, image: logo.image });
      setEditingId(id);
      setShowAddForm(true);
    }
  };

  const handleUpdateLogo = () => {
    if (!formData.name || !formData.url || !formData.image) {
      alert('Please fill all fields');
      return;
    }

    setLogos(logos.map(logo => 
      logo.id === editingId 
        ? { ...logo, ...formData }
        : logo
    ));
    
    setFormData({ name: '', url: '', image: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleDeleteLogo = (id: string) => {
    if (confirm('Are you sure you want to delete this logo?')) {
      setLogos(logos.filter(logo => logo.id !== id));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Convert to base64 for preview (in production, upload to storage)
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData({ ...formData, image: result });
    };
    reader.readAsDataURL(file);
  };

  const moveLogoUp = (index: number) => {
    if (index === 0) return;
    const newLogos = [...logos];
    [newLogos[index - 1], newLogos[index]] = [newLogos[index], newLogos[index - 1]];
    setLogos(newLogos);
  };

  const moveLogoDown = (index: number) => {
    if (index === logos.length - 1) return;
    const newLogos = [...logos];
    [newLogos[index], newLogos[index + 1]] = [newLogos[index + 1], newLogos[index]];
    setLogos(newLogos);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading CMS data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Landing Page CMS</h1>
          <p className={styles.subtitle}>Manage company logos displayed on the landing page</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <Eye size={18} />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={saveData}
            disabled={saving}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Preview Mode */}
      {previewMode ? (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h2>Logo Cloud Preview</h2>
            <p>This is how the logos appear on the landing page</p>
          </div>
          <div className={styles.logoCloudPreview}>
            <h3 className={styles.logoCloudTitle}>TRUSTED BY LEADING ORGANIZATIONS</h3>
            {logos.length === 0 ? (
              <p className={styles.emptyMessage}>No logos added yet</p>
            ) : (
              <div className={styles.logoGrid}>
                {logos.map((logo) => (
                  <a
                    key={logo.id}
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.logoItem}
                  >
                    <img src={logo.image} alt={logo.name} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Add/Edit Form */}
          {showAddForm && (
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h3>{editingId ? 'Edit Logo' : 'Add New Logo'}</h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({ name: '', url: '', image: '' });
                  }}
                  className={styles.closeBtn}
                >
                  <X size={20} />
                </button>
              </div>
              <div className={styles.formBody}>
                <div className={styles.formGroup}>
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Microsoft, Google, Apple"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company Website URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Logo Image</label>
                  <div className={styles.imageUpload}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.fileInput}
                      id="logoUpload"
                    />
                    <label htmlFor="logoUpload" className={styles.uploadBtn}>
                      <Upload size={18} />
                      Choose Image
                    </label>
                    {formData.image && (
                      <div className={styles.imagePreview}>
                        <img src={formData.image} alt="Preview" />
                      </div>
                    )}
                  </div>
                  <small>Max 2MB. Recommended: PNG with transparent background, ~200x80px</small>
                </div>
                <div className={styles.formActions}>
                  {editingId ? (
                    <button onClick={handleUpdateLogo} className={`${styles.btn} ${styles.btnPrimary}`}>
                      <Save size={18} />
                      Update Logo
                    </button>
                  ) : (
                    <button onClick={handleAddLogo} className={`${styles.btn} ${styles.btnPrimary}`}>
                      <Plus size={18} />
                      Add Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Logos List */}
          <div className={styles.logosSection}>
            <div className={styles.sectionHeader}>
              <h2>Company Logos ({logos.length})</h2>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  <Plus size={18} />
                  Add Logo
                </button>
              )}
            </div>

            {logos.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Upload size={48} />
                </div>
                <h3>No logos added yet</h3>
                <p>Add company logos to display them on your landing page</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  <Plus size={18} />
                  Add Your First Logo
                </button>
              </div>
            ) : (
              <div className={styles.logosList}>
                {logos.map((logo, index) => (
                  <div key={logo.id} className={styles.logoCard}>
                    <div className={styles.logoCardContent}>
                      <div className={styles.dragHandle}>
                        <GripVertical size={20} />
                      </div>
                      <div className={styles.logoPreview}>
                        <img src={logo.image} alt={logo.name} />
                      </div>
                      <div className={styles.logoInfo}>
                        <h4>{logo.name}</h4>
                        <a href={logo.url} target="_blank" rel="noopener noreferrer">
                          {logo.url}
                        </a>
                      </div>
                    </div>
                    <div className={styles.logoActions}>
                      <button
                        onClick={() => moveLogoUp(index)}
                        disabled={index === 0}
                        className={styles.iconBtn}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveLogoDown(index)}
                        disabled={index === logos.length - 1}
                        className={styles.iconBtn}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleEditLogo(logo.id)}
                        className={styles.iconBtn}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteLogo(logo.id)}
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
