import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "./supabaseClient";
import './styles.css';
// import LoginModal from './components/LoginModal';

const myAdminEmail = "tylermkimberlin@gmail.com";

const initialResponses = [
  { id: "hardcoded-1", name: "Madison Thurman", text: "I grew up in Edinburgh and would frequently pass through Franklin. I would see the Benjamin Franklin statue and dream about being at that college. I'm now finishing up my freshman year as a Franklin College student:)", created_at: "2023-01-01T00:00:00Z" },
  { id: "hardcoded-2", name: "Kathy Mowry", text: "Franklin is special to me because it has a \"hometown feel\". We loved living in Franklin and have many friends that are like family to us. ❤️", created_at: "2023-01-02T00:00:00Z" },
  { id: "hardcoded-3", name: "Rachel Mahurin", text: "I grew up on the near east side of Indy and moved to Nblsv for 5 years. I've been in Franklin now for over 2.5 years and my 💗 has never felt more at home. I would say it's the community that makes it feel like home. I see people coming together in a way l've not really experienced in other places.", created_at: "2023-01-03T00:00:00Z" },
  { id: "hardcoded-4", name: "Paula Prentice Law", text: "I love that people gather downtown Franklin and walk up and down the streets. I also enjoy all the activities they schedule downtown.", created_at: "2023-01-04T00:00:00Z" },
  { id: "hardcoded-5", name: "Ellen Guido", text: "I am from NYC. I moved to Indiana in 1989. When I first got here I hated it, 30 years later I love it in Indiana and consider it my home. I wish I could have gone to school here too. There are far too many things and reasons why Indiana, particularly Franklin Indiana is my home.", created_at: "2023-01-05T00:00:00Z" },
  { id: "hardcoded-6", name: "Ashlyn Myers", text: "I love how, despite it's continuous innovations, Franklin still gives me the same small-town feeling I've always felt, especially when visiting downtown. The people and businesses are what make Franklin feel so cozy, and I just love it! How lucky are we to live in a town that feels like a Hallmark movie?", created_at: "2023-01-06T00:00:00Z" },
  { id: "hardcoded-7", name: "Rebecca June Wilson Zarrinnegar", text: "We lived there for 26 years, raised our kids there, we still love that little town and the community! We still go there often! We now live in Indy but miss that small town charm!", created_at: "2023-01-07T00:00:00Z" },
  { id: "hardcoded-8", name: "Anonymous", text: "We love Province park, the walking trails also great for family get togethers. Also downtown is great with all the different shops and restaurants.", created_at: "2023-01-08T00:00:00Z" },
  { id: "hardcoded-9", name: "Teresa Rexroat", text: "I love the history of it all. My grandmas house where my mom and her sister grew up. We spent a lot of time at the Province park. Now we walk the trails in the park which is beutiful. I enjoy the amphitheater, the cruise-ins and the farmers mkt.", created_at: "2023-01-09T00:00:00Z" },
  { id: "hardcoded-10", name: "Carrie Lautzenhiser", text: "What I love about franklin!! I love the artcraft and all the amazing movies they play. I love the small town feeling!! It's a great small town.  I love how every year they do the memorable day mile to honor the brave that life their life!!", created_at: "2023-01-10T00:00:00Z" },
  { id: "hardcoded-11", name: "Judy Dewitt", text: "I like living in Franklin because historical places and events are respected even as the town grows.", created_at: "2023-01-11T00:00:00Z" }
];


export default function App() {
  console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("SUPABASE KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);
  const [responses, setResponses] = useState(initialResponses);
  // const [user, setUser] = useState(null);
  const [expandedBox, setExpandedBox] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const [heldBox, setHeldBox] = useState(null);
  const [formData, setFormData] = useState({ name: "", text: "" });
  const boxesRef = useRef([]);
  const holdTimers = useRef({});
  // const [showLoginModal, setShowLoginModal] = useState(false);

  //useEffect(() => {
    //const fetchUser = async () => {
      //const { data: { user } } = await supabase.auth.getUser();
      //setUser(user);
    //};
    //fetchUser();
  //}, []);

  useEffect(() => {
    const fetchResponses = async () => {
      const { data, error } = await supabase.from("responses").select("*");
      if (!error && data) {
        const combined = [...initialResponses, ...data];
        combined.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setResponses(combined);
      }
    };
    fetchResponses();
  }, []);

 // const isOwnerOrAdmin = (responseUserId) => {
  //  return user && (user.email === myAdminEmail || user.id === responseUserId);
  //};

  const isOwnerOrAdmin = () => false;

  const handleBoxClick = (id) => {
    if (isHolding || heldBox === id) return;
    setExpandedBox(prev => (prev === id ? null : id));
  };

  const handleClickOutside = (e) => {
    if (!boxesRef.current.some(ref => ref && ref.contains(e.target))) {
      setExpandedBox(null);
      setHeldBox(null);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) return;
  
    const { data, error } = await supabase
      .from("responses")
      .insert([
        {
          name: formData.name,
          text: formData.text,
          created_at: new Date().toISOString()
        }
      ])
      .select();
  
    // ✅ Log any Supabase error
    if (error) {
      console.error("Supabase insert error:", error);
      return;
    }
  
    // ✅ Log returned data (helpful if insert silently fails)
    console.log("Inserted data:", data);
  
    if (data && data.length > 0) {
      const updated = [...responses, data[0]];
      updated.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setResponses(updated);
      setFormData({ name: "", text: "" });
    }
  };
  

  const handleDelete = async (id) => {
    const isHardcoded = id.startsWith("hardcoded");
    if (isHardcoded) {
      setResponses(prev => prev.filter(r => r.id !== id));
    } else {
      const { error } = await supabase.from("responses").delete().eq("id", id);
      if (!error) {
        setResponses(prev => prev.filter(r => r.id !== id));
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="main-wrapper">
      <header className="header">
        <motion.h1
          className="title"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          What Makes Franklin Special?
        </motion.h1>
      </header>

      <form className="submit-form" onSubmit={handleSubmit}>
        <h2>We'd love to hear your story</h2>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="text-input"
          //onFocus={() => !user && setShowLoginModal(true)}
        />
        <textarea
          name="text"
          rows="5"
          placeholder="Tell us what makes Franklin special to you..."
          value={formData.text}
          onChange={handleInputChange}
          required
          className="text-input"
          //onFocus={() => !user && setShowLoginModal(true)}
        />
        <button type="submit">Submit</button>
      </form>

      {/*showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />} */}

      <section className="canva-layout">
        <div className="staggered-layout">
          {responses.map((response, index) => (
            <ExpandableBox
              key={response.id}
              id={response.id}
              name={response.name}
              text={response.text}
              userId={response.user_id}
              //currentUser={user}
              //isOwnerOrAdmin={isOwnerOrAdmin(response.user_id)}
              isOwnerOrAdmin={false}
              expanded={expandedBox === response.id || heldBox === response.id}
              handleBoxClick={handleBoxClick}
              offset={index % 2 === 0 ? 'left-stagger' : 'right-stagger'}
              boxRef={el => boxesRef.current[index] = el}
              setIsHolding={setIsHolding}
              setHeldBox={setHeldBox}
              holdTimers={holdTimers}
              onDelete={handleDelete}
              onEdit={() => alert("Edit functionality coming soon!")}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

const ExpandableBox = ({
  id, name, text, expanded, handleBoxClick, offset,
  boxRef, setIsHolding, setHeldBox, holdTimers,
  isOwnerOrAdmin, onDelete, onEdit
}) => {
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

  return (
    <motion.div
      className={`box ${offset} ${expanded ? 'expanded' : ''}`}
      ref={boxRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={(e) => {
        e.stopPropagation();
        handleBoxClick(id);
      }}
      animate={{
        height: expanded ? "auto" : 170,
        width: "45%"
      }}
      whileHover={{
        scale: 1.04,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)'
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      layout
    >
      <p className="name"><strong>{name}</strong></p>
      <p>{expanded ? text : text.length > 100 ? text.substring(0, 100) + "..." : text}</p>
      <span className="read-more">{expanded ? "Show Less" : "Read More"}</span>
      {isOwnerOrAdmin && (
        <div className="admin-controls">
          <button className="edit-btn" onClick={onEdit}>Edit</button>
          <button className="delete-btn" onClick={() => {
            if (window.confirm("Are you sure you want to delete this response?")) {
              onDelete(id);
            }
          }}>Delete</button>
        </div>
      )}
    </motion.div>
  );
};
