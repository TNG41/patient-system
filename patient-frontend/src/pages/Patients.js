import React, { useEffect, useState } from "react";
import api from "../api";
import "./Patients.css"; // We'll create this file next

function Patients({ token, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get(`/patients${showAll ? "?all=true" : ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, [token, showAll]);

  // Add patient
  const handleAdd = async () => {
    if (!firstName || !lastName) return;
    try {
      await api.post(
        "/patients",
        { first_name: firstName, last_name: lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFirstName("");
      setLastName("");
      setShowAll(false); // refresh list to own patients
    } catch (err) {
      console.error(err);
      alert("Failed to add patient");
    }
  };

  // Delete patient
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await api.delete(`/patients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPatients(patients.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete patient");
    }
  };

  // Start editing
  const startEdit = (patient) => {
    setEditingId(patient.id);
    setEditFirstName(patient.first_name);
    setEditLastName(patient.last_name);
  };

  // Save edit
  const handleEditSave = async (id) => {
    try {
      await api.put(
        `/patients/${id}`,
        { first_name: editFirstName, last_name: editLastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      const res = await api.get(`/patients${showAll ? "?all=true" : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to update patient");
    }
  };

  return (
    <div className="patients-container">
      <div className="header">
        <h2>Patients</h2>
        <div>
          <button onClick={onLogout}>Logout</button>
          <button onClick={() => setShowAll(false)}>Show My Patients</button>
          <button onClick={() => setShowAll(true)}>Show All Patients</button>
        </div>
      </div>

      <div className="add-patient">
        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <button onClick={handleAdd}>Add Patient</button>
      </div>

      <table className="patients-table">
        <thead>
            <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Created By</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {patients.map((p) => (
            <tr key={p.id}>
                <td>{p.id}</td>
                {editingId === p.id ? (
                <>
                    <td><input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} /></td>
                    <td><input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} /></td>
                    <td>{p.doctor_first} {p.doctor_last}</td>
                    <td>
                    <button onClick={() => handleEditSave(p.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                </>
                ) : (
                <>
                    <td>{p.first_name}</td>
                    <td>{p.last_name}</td>
                    <td>{p.doctor_first} {p.doctor_last}</td>
                    <td>
                    <button onClick={() => startEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                </>
                )}
            </tr>
            ))}
        </tbody>
        </table>

    </div>
  );
}

export default Patients;
