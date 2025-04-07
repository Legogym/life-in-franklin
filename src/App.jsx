import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import './styles.css';
import { supabase } from './supabaseClient';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e?.message?.includes('Loading chunk') && e?.message?.includes('failed')) {
      console.warn('Chunk load failed. Reloading...');
      window.location.reload();
    }
  });
}

const initialResponses = [];

export default function App() {
  const [responses, setResponses] = useState([]);
  const [expandedBox, setExpandedBox] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const [heldBox, setHeldBox] = useState(null);
  const [formData, setFormData] = useState({ name: "", text: "" });
  const [submitted, setSubmitted] = useState(false);
  const [userIds, setUserIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const boxesRef = useRef([]);
  const holdTimers = useRef({});

  useEffect(() => {
    const fetchResponses = async () => {
      const saved = localStorage.getItem("franklinUserResponses");
      const userResponses = saved ? JSON.parse(saved) : [];

      const { data, error } = await supabase.from('responses').select('*').order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching from Supabase:", error);
        setResponses([...userResponses]);
      } else {
        const combinedResponses = [...userResponses, ...data.filter(r => !userResponses.some(ur => ur.id === r.id))];
        setResponses(combinedResponses);
      }

      setUserIds(userResponses.map(r => r.id));
    };

    fetchResponses();

    return () => {
      Object.values(holdTimers.current).forEach(clearTimeout);
    };
  }, []);

  const saveUserResponses = (userResponses) => {
    localStorage.setItem("franklinUserResponses", JSON.stringify(userResponses));
    setUserIds(userResponses.map(r => r.id));
  };

  const handleBoxClick = (id) => {
    if (isHolding || heldBox === id) return;
    setExpandedBox(prev => (prev === id ? null : id));
  };

  const handleClickOutside = (event) => {
    if (!boxesRef.current?.some(ref => ref?.contains?.(event.target))) {
      setExpandedBox(null);
      setHeldBox(null);
      setEditingId(null);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const setAnonymous = () => {
    setFormData(prev => ({ ...prev, name: "Anonymous" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.from('responses').insert([
        { name: formData.name, text: formData.text }
      ]).select();

      if (error) throw error;

      const savedResponse = data[0];
      const updatedUserResponses = [savedResponse, ...responses.filter(r => userIds.includes(r.id))];
      const updatedResponses = [savedResponse, ...responses];
      setResponses(updatedResponses);
      saveUserResponses(updatedUserResponses);
      setFormData({ name: "", text: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("Submission failed:", err.message);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (id, text) => {
    setExpandedBox(id);
    setEditingId(id);
    setEditText(text);
  };

  const handleEditChange = (e) => {
    setEditText(e.target.value);
  };

  const handleSaveEdit = async (id) => {
    const updatedResponses = responses.map(r =>
      r.id === id ? { ...r, text: editText } : r
    );
    setResponses(updatedResponses);
    saveUserResponses(updatedResponses.filter(r => userIds.includes(r.id)));
    setEditingId(null);

    try {
      await supabase.from('responses').update({ text: editText }).eq('id', id);
    } catch (error) {
      console.error("Edit sync error:", error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this response?")) {
      const updatedResponses = responses.filter(r => r.id !== id);
      const updatedUserResponses = updatedResponses.filter(r => userIds.includes(r.id));
      setResponses(updatedResponses);
      saveUserResponses(updatedUserResponses);

      try {
        await supabase.from('responses').delete().eq('id', id);
      } catch (error) {
        console.error("Delete sync error:", error.message);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="main-wrapper">
      <header className="header">
        <motion.h1 className="title" initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}>
          FRANKLIN
        </motion.h1>
        <motion.p className="sub-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}>
          THE ROOTS OF OUR COMMUNITY
        </motion.p>
      </header>

      <form className="submit-form" onSubmit={handleSubmit}>
        <h2>What do you love about Franklin</h2>
        <div className="name-section">
          <input type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleInputChange} required className="text-input" />
          <button type="button" className="anonymous-button" onClick={setAnonymous}>Submit as Anonymous</button>
        </div>
        <textarea name="text" rows="5" placeholder="Tell us what makes Franklin special to you and why you love it..." maxLength={500} value={formData.text} onChange={handleInputChange} required className="text-input" />
        <p>{formData.text.length}/500</p>
        <button type="submit" disabled={isSubmitting}>Submit</button>
        {submitted && <p className="success-message">Thanks for sharing your story! 💬</p>}
      </form>

      <section className="canva-layout">
        <div className="staggered-layout">
          {responses.map((response, index) => (
            <ExpandableBox
              key={response.id}
              id={response.id}
              name={response.name}
              text={response.text}
              expanded={expandedBox === response.id || heldBox === response.id}
              handleBoxClick={handleBoxClick}
              offset={index % 2 === 0 ? 'left-stagger' : 'right-stagger'}
              boxRef={el => boxesRef.current[index] = el}
              setIsHolding={setIsHolding}
              setHeldBox={setHeldBox}
              holdTimers={holdTimers}
              isUserPost={userIds.includes(response.id)}
              editing={editingId === response.id}
              editText={editText}
              onEdit={handleEdit}
              onSave={handleSaveEdit}
              onEditChange={handleEditChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

const ExpandableBox = ({ id, name, text, expanded, handleBoxClick, offset, boxRef, setIsHolding, setHeldBox, holdTimers, isUserPost, editing, editText, onEdit, onSave, onEditChange, onDelete }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  const handleMouseDown = () => {
    setIsHolding(true);
    holdTimers.current[id] = setTimeout(() => {
      setHeldBox(id);
    }, 500);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    clearTimeout(holdTimers.current[id]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBoxClick(id);
    }
  };

  return (
    <motion.div
      className={`box ${offset} ${expanded ? 'expanded' : ''}`}
      ref={boxRef}
      tabIndex="0"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.stopPropagation();
        handleBoxClick(id);
      }}
      animate={expanded ? "open" : "closed"}
      variants={{ open: { maxHeight: 1000, opacity: 1 }, closed: { maxHeight: 120, opacity: 1 } }}
      whileHover={{ scale: 1.04, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)' }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      layout
    >
      <div className="name-header">
        <p className="name"><strong>{name}</strong></p>
      </div>
      {editing ? (
        <>
          <textarea ref={textareaRef} aria-label="Edit your response" value={editText} onChange={onEditChange} className="text-input" />
          <div className="edit-buttons">
            <button onClick={() => onSave(id)}>Save</button>
            <button onClick={() => setHeldBox(null)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <p>{expanded || text.length <= 50 ? text : text.substring(0, 50) + "..."}</p>
          <span className="read-more">{expanded ? "Show Less" : "Read More"}</span>
          {isUserPost && expanded && (
            <div className="button-group">
              <button onClick={() => onEdit(id, text)}>Edit</button>
              <button onClick={() => onDelete(id)}>Delete</button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
