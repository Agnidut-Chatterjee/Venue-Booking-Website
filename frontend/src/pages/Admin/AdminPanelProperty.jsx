import React, { useState, useEffect } from "react";

function AdminPanelProperty() {
  const [venues, setVenues] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // NEW STATE: Holds the actual binary files
  const [selectedFiles, setSelectedFiles] = useState([]);

  const initialFormState = {
    venueName: "",
    venueType: "Hall",
    address: "",
    contactNo: "",
    landlineNumber: "",
    charges: "",
    description: {
      capacity: "",
      cateringFacilities: false,
      parkingWifi: false,
      brideRoom: false,
    }
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const fetchVenues = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/venues");
      const data = await response.json();
      setVenues(data);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("description.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        description: {
          ...formData.description,
          [field]: type === "checkbox" ? checked : value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- NEW: Handle Drag and Drop / File Selection ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("You can only upload a maximum of 5 images.");
      return;
    }
    setSelectedFiles(files);
  };

  // --- NEW: Submit using FormData ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && selectedFiles.length === 0) {
      alert("Please select at least 1 image for the new property.");
      return;
    }

    // 1. Create the digital shipping crate
    const submitData = new FormData();
    
    // 2. Append standard text fields
    submitData.append("venueName", formData.venueName);
    submitData.append("venueType", formData.venueType);
    submitData.append("address", formData.address);
    submitData.append("contactNo", formData.contactNo);
    submitData.append("landlineNumber", formData.landlineNumber);
    submitData.append("charges", formData.charges);
    
    // 3. Append nested description as a JSON string
    submitData.append("description", JSON.stringify(formData.description));

    // 4. Append the actual physical files
    selectedFiles.forEach((file) => {
      submitData.append("images", file);
    });

    const url = isEditing 
      ? `http://localhost:5000/api/venues/${editId}` 
      : "http://localhost:5000/api/venues";
    
    const method = isEditing ? "PUT" : "POST";

    try {
      // NOTE: When sending FormData, DO NOT set the 'Content-Type' header. 
      // The browser automatically sets it to 'multipart/form-data' with a special boundary.
      const response = await fetch(url, {
        method: method,
        body: submitData
      });

      if (response.ok) {
        fetchVenues();
        handleCancel();
      } else {
        console.error("Failed to save venue");
      }
    } catch (error) {
      console.error("Error saving venue:", error);
    }
  };

  const handleEdit = (venue) => {
    setFormData({
      venueName: venue.venueName,
      venueType: venue.venueType,
      address: venue.address,
      contactNo: venue.contactNo,
      landlineNumber: venue.landlineNumber || "",
      charges: venue.charges,
      description: {
        capacity: venue.description.capacity,
        cateringFacilities: venue.description.cateringFacilities,
        parkingWifi: venue.description.parkingWifi,
        brideRoom: venue.description.brideRoom,
      }
    });
    setSelectedFiles([]); // Clear out selected files on edit (uses old ones unless new are selected)
    setIsEditing(true);
    setEditId(venue._id);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/venues/${id}`, { method: "DELETE" });
        if (response.ok) fetchVenues();
      } catch (error) {
        console.error("Error deleting venue:", error);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData(initialFormState);
    setSelectedFiles([]);
  };

  return (
    <div className="admin-container" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header className="admin-header" style={{ marginBottom: "20px" }}>
        <h2>Admin Dashboard - Properties</h2>
        <p>Manage your venues for অতিথি আপ্যায়ন</p>
      </header>

      <div className="admin-form-container" style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        <h3>{isEditing ? "Update Property" : "Add New Property"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
          
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input type="text" name="venueName" placeholder="Venue Name *" value={formData.venueName} onChange={handleInputChange} required style={{ padding: "8px", flex: "1 1 200px" }} />
            <select name="venueType" value={formData.venueType} onChange={handleInputChange} required style={{ padding: "8px", flex: "1 1 200px" }}>
              <option value="Hotel">Hotel</option>
              <option value="Garden">Garden</option>
              <option value="Hall">Hall</option>
            </select>
            <input type="text" name="address" placeholder="Address *" value={formData.address} onChange={handleInputChange} required style={{ padding: "8px", flex: "1 1 200px" }} />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input type="text" name="contactNo" placeholder="Contact No *" value={formData.contactNo} onChange={handleInputChange} required style={{ padding: "8px", flex: "1 1 200px" }} />
            <input type="text" name="landlineNumber" placeholder="Landline (Optional)" value={formData.landlineNumber} onChange={handleInputChange} style={{ padding: "8px", flex: "1 1 200px" }} />
            <input type="text" name="charges" placeholder="Charges (e.g. ₹1000 per plate) *" value={formData.charges} onChange={handleInputChange} required style={{ padding: "8px", flex: "1 1 200px" }} />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <input type="number" name="description.capacity" placeholder="Capacity (Persons) *" value={formData.description.capacity} onChange={handleInputChange} required style={{ padding: "8px", flex: "1 1 150px" }} />
          </div>

          {/* --- NEW: DRAG AND DROP FILE INPUT --- */}
          <div style={{ border: "2px dashed #007bff", padding: "20px", textAlign: "center", borderRadius: "8px", backgroundColor: "#eef6ff", marginTop: "10px" }}>
            <label style={{ cursor: "pointer", display: "block", color: "#007bff", fontWeight: "bold" }}>
              <p style={{ margin: "0 0 10px 0" }}>
                {isEditing ? "Drag & Drop to replace images (Max 5)" : "Drag & Drop up to 5 images here, or click to select"}
              </p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: "none" }} // Hides default button
              />
              <span style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", borderRadius: "4px", fontSize: "0.9rem" }}>
                Browse Files
              </span>
            </label>
            {selectedFiles.length > 0 && (
              <p style={{ marginTop: "15px", color: "#28a745", fontWeight: "bold" }}>
                ✅ {selectedFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
            <label><input type="checkbox" name="description.cateringFacilities" checked={formData.description.cateringFacilities} onChange={handleInputChange} /> Catering Facilities</label>
            <label><input type="checkbox" name="description.parkingWifi" checked={formData.description.parkingWifi} onChange={handleInputChange} /> Parking / WiFi</label>
            <label><input type="checkbox" name="description.brideRoom" checked={formData.description.brideRoom} onChange={handleInputChange} /> Bride Room</label>
          </div>
          
          <div style={{ marginTop: "10px" }}>
            <button type="submit" style={{ padding: "10px 20px", backgroundColor: isEditing ? "#007bff" : "#28a745", color: "#fff", border: "none", cursor: "pointer", borderRadius: "4px" }}>
              {isEditing ? "Save Changes" : "Add Property"}
            </button>
            {(isEditing || formData.venueName) && (
              <button type="button" onClick={handleCancel} style={{ padding: "10px 20px", marginLeft: "10px", backgroundColor: "#6c757d", color: "#fff", border: "none", cursor: "pointer", borderRadius: "4px" }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "12px" }}>Thumbnail</th>
              <th style={{ padding: "12px" }}>Venue Name</th>
              <th style={{ padding: "12px" }}>Type</th>
              <th style={{ padding: "12px" }}>Location</th>
              <th style={{ padding: "12px" }}>Charges</th>
              <th style={{ padding: "12px" }}>Capacity</th>
              <th style={{ padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {venues.length > 0 ? (
              venues.map((venue) => (
                <tr key={venue._id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>
                    <img
                      // The URL now points to your backend server
                      src={`http://localhost:5000${venue.images && venue.images.length > 0 ? venue.images[0] : ""}`}
                      alt={venue.venueName}
                      style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px", backgroundColor: "#eee" }}
                    />
                  </td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{venue.venueName}</td>
                  <td style={{ padding: "12px" }}>{venue.venueType}</td>
                  <td style={{ padding: "12px" }}>{venue.address}</td>
                  <td style={{ padding: "12px" }}>{venue.charges}</td>
                  <td style={{ padding: "12px" }}>{venue.description?.capacity || "N/A"}</td>
                  <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                    <button onClick={() => handleEdit(venue)} style={{ padding: "6px 12px", marginRight: "8px", cursor: "pointer", backgroundColor: "#ffc107", border: "none", borderRadius: "4px" }}>Edit</button>
                    <button onClick={() => handleDelete(venue._id)} style={{ padding: "6px 12px", cursor: "pointer", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>No properties found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanelProperty;