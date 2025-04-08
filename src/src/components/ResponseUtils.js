import { supabase } from "../supabaseClient";

const myAdminEmail = "tylermkimberlin@gmail.com";

const initialResponses = [
  // ⬇️ Copy your hardcoded responses here
];

const ExpandableBox = ({ response, user, onEdit, onDelete }) => {
  const isOwnerOrAdmin = user?.email === myAdminEmail || user?.id === response.user_id;

  return (
    <div className="response-box">
      <p><strong>{response.name}</strong></p>
      <p>{response.text}</p>
      {isOwnerOrAdmin && (
        <div className="admin-controls">
          <button className="edit-btn" onClick={() => onEdit(response)}>Edit</button>
          <button className="delete-btn" onClick={() => {
            if (window.confirm("Are you sure you want to delete this response?")) {
              onDelete(response.id);
            }
          }}>Delete</button>
        </div>
      )}
    </div>
  );
};

const handleDelete = async (id, setResponses) => {
  const isHardcoded = id.startsWith("hardcoded");
  if (isHardcoded) {
    setResponses(prev => prev.filter(r => r.id !== id));
  } else {
    const { error } = await supabase.from("responses").delete().eq("id", id);
    if (!error) {
      setResponses(prev => prev.filter(r => r.id !== id));
    } else {
      console.error("Delete error:", error.message);
    }
  }
};

export { initialResponses, ExpandableBox, handleDelete };
