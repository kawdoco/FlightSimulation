import { useEffect, useState } from "react";

import {
  getAllAircraft,
  createAircraft,
  updateAircraft,
  deleteAircraft,
} from "../services/aircraftService";

const emptyForm = {
  registrationNumber: "",
  model: "",
  manufacturer: "",
  status: "AVAILABLE",
  fuelCapacity: "",
  maxSpeed: "",
  maxAltitude: "",
};

const fields = [
  {
    name: "registrationNumber",
    label: "Registration Number",
    type: "text",
    placeholder: "4R-ABC",
  },
  {
    name: "model",
    label: "Model",
    type: "text",
    placeholder: "Airbus A320",
  },
  {
    name: "manufacturer",
    label: "Manufacturer",
    type: "text",
    placeholder: "Airbus",
  },
  {
    name: "fuelCapacity",
    label: "Fuel Capacity (L)",
    type: "number",
    placeholder: "24210",
  },
  {
    name: "maxSpeed",
    label: "Maximum Speed (km/h)",
    type: "number",
    placeholder: "871",
  },
  {
    name: "maxAltitude",
    label: "Maximum Altitude (ft)",
    type: "number",
    placeholder: "39800",
  },
];

function getErrorMessage(error, fallback) {
  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  return fallback;
}

function AircraftPage() {
  const [aircraft, setAircraft] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAircraft = async () => {
    setLoading(true);

    try {
      const data = await getAllAircraft();
      setAircraft(data);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load aircraft.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAircraft();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (busy) {
      return;
    }

    setMessage("");
    setError("");

    const payload = {
      ...form,
      registrationNumber: form.registrationNumber.trim(),
      model: form.model.trim(),
      manufacturer: form.manufacturer.trim(),
      fuelCapacity: Number(form.fuelCapacity),
      maxSpeed: Number(form.maxSpeed),
      maxAltitude: Number(form.maxAltitude),
    };

    if (
      !payload.registrationNumber ||
      !payload.model ||
      !payload.manufacturer
    ) {
      setError("Please complete all text fields.");
      return;
    }

    if (
      [payload.fuelCapacity, payload.maxSpeed, payload.maxAltitude]
        .some((value) => !Number.isFinite(value) || value <= 0)
    ) {
      setError("Fuel capacity, speed and altitude must be greater than zero.");
      return;
    }

    setBusy(true);

    try {
      if (editingId !== null) {
        await updateAircraft(editingId, payload);
        setMessage("Aircraft updated successfully.");
      } else {
        await createAircraft(payload);
        setMessage("Aircraft added successfully.");
      }

      resetForm();
      await loadAircraft();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save aircraft. Check the registration number and input values."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (item) => {
    setMessage("");
    setError("");
    setEditingId(item.id);

    setForm({
      registrationNumber: item.registrationNumber ?? "",
      model: item.model ?? "",
      manufacturer: item.manufacturer ?? "",
      status: item.status ?? "AVAILABLE",
      fuelCapacity: item.fuelCapacity ?? "",
      maxSpeed: item.maxSpeed ?? "",
      maxAltitude: item.maxAltitude ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (busy) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this aircraft?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");
    setBusy(true);

    try {
      await deleteAircraft(id);

      if (editingId === id) {
        resetForm();
      }

      setMessage("Aircraft deleted successfully.");
      await loadAircraft();
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to delete aircraft.")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="aircraft-page">
      <div className="page-header">
        <div>
          <h1>Aircraft Management</h1>
          <p>
            Manage aircraft available for flight simulation and monitoring.
          </p>
        </div>

        <div className="aircraft-count">
          {aircraft.length} Aircraft
        </div>
      </div>

      {message && (
        <div className="success-message" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <section className="management-card">
        <div className="management-card-header">
          <h2>
            {editingId !== null
              ? "Update Aircraft"
              : "Register Aircraft"}
          </h2>
        </div>

        <form
          className="aircraft-form"
          onSubmit={handleSubmit}
        >
          {fields.map((field) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={field.name}>
                {field.label}
              </label>

              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                min={field.type === "number" ? "0.01" : undefined}
                step={field.type === "number" ? "any" : undefined}
                disabled={busy}
                required
              />
            </div>
          ))}

          <div className="form-group">
            <label htmlFor="status">Status</label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={busy}
              required
            >
              <option value="AVAILABLE">Available</option>
              <option value="IN_FLIGHT">In Flight</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={busy}
            >
              {busy
                ? "Please wait..."
                : editingId !== null
                  ? "Update Aircraft"
                  : "Add Aircraft"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
                disabled={busy}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="management-card">
        <div className="management-card-header">
          <h2>Aircraft Fleet</h2>
        </div>

        {loading ? (
          <p>Loading aircraft...</p>
        ) : aircraft.length === 0 ? (
          <div className="empty-state">
            No aircraft registered.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="aircraft-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Registration</th>
                  <th>Model</th>
                  <th>Manufacturer</th>
                  <th>Status</th>
                  <th>Fuel Capacity</th>
                  <th>Max Speed</th>
                  <th>Max Altitude</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {aircraft.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.registrationNumber}</td>
                    <td>{item.model}</td>
                    <td>{item.manufacturer}</td>

                    <td>
                      <span
                        className={`aircraft-status ${
                          (item.status ?? "")
                            .toLowerCase()
                            .replace(/_/g, "-")
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>{item.fuelCapacity} L</td>
                    <td>{item.maxSpeed} km/h</td>
                    <td>{item.maxAltitude} ft</td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => handleEdit(item)}
                          disabled={busy}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDelete(item.id)}
                          disabled={busy}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AircraftPage;