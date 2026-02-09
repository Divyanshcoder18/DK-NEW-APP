import { useState } from "react";
import { useCreateRoom } from "../../hooks/useRoom";

const CreateRoomModal = ({ isOpen, onClose }) => {
    const { createRoom, loading } = useCreateRoom();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        roomType: "public"
    });
    const [errors, setErrors] = useState({});      
    // 1️⃣ Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing.....
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };
    // 2️⃣ Validate form   
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Room name is required";
        }else if (formData.name.trim().length < 3) {
            newErrors.name = "Room name must be at least 3 characters";
        }else if (formData.name.trim().length > 50) {
            newErrors.name = "Room name must be less than 50 characters";
        }

        if (formData.description.length > 200) {
            newErrors.description = "Description must be less than 200 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 3️⃣ Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const result = await createRoom(formData);

        if (result) {
            // Success - close modal and reset form
            resetForm();
            onClose();
        }
    };

    // 4️⃣ Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            roomType: "public"
        });
        setErrors({});
    };

    // 5️⃣ Handle close (also reset form)
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Don't render if not open
    if (!isOpen) return null;
    return (
        <>
            {/* Backdrop overlay */}
            <div className="modal-backdrop" onClick={handleClose}></div>
            {/* Modal container */}
            <div className="modal-container">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header">
                        <h2>Create New Room</h2>
                        <button
                            className="modal-close-btn"
                            onClick={handleClose}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Room Name */}
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Room Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`form-input ${errors.name ? "error" : ""}`}
                                placeholder="e.g., General Chat"
                                maxLength={50}
                                autoFocus
                            />
                            {errors.name && (
                                <span className="error-message">{errors.name}</span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">
                                Description (optional)
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={`form-textarea ${errors.description ? "error" : ""}`}
                                placeholder="What is this room about?"
                                rows={3}
                                maxLength={200}
                            />
                            <div className="char-count">
                                {formData.description.length}/200
                            </div>
                            {errors.description && (
                                <span className="error-message">{errors.description}</span>
                            )}
                        </div>

                        {/* Room Type */}
                        <div className="form-group">
                            <label className="form-label">Room Type</label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="roomType"
                                        value="public"
                                        checked={formData.roomType === "public"}
                                        onChange={handleChange}
                                    />
                                    <span className="radio-text">
                                        <span className="radio-icon">🌐</span>
                                        <div>
                                            <strong>Public</strong>
                                            <p>Anyone can discover and join</p>
                                        </div>
                                    </span>
                                </label>

                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="roomType"
                                        value="private"
                                        checked={formData.roomType === "private"}
                                        onChange={handleChange}
                                    />
                                    <span className="radio-text">
                                        <span className="radio-icon">🔒</span>
                                        <div>
                                            <strong>Private</strong>
                                            <p>Only invited members can join</p>
                                        </div>
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Creating...
                                        
                                    </>
                                ) : (
                                    "Create Room"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateRoomModal;
