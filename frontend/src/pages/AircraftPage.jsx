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

const AircraftPage = () => {
  const [aircraft, setAircraft] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAircraft = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllAircraft();

      setAircraft(data);
    } catch (err) {
      console.error(err);
<<<<<<< HEAD
=======

>>>>>>> origin/develop
      setError("Unable to load aircraft.");
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
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const payload = {
      ...form,
<<<<<<< HEAD

      fuelCapacity:
        form.fuelCapacity === ""
          ? 0
          : Number(form.fuelCapacity),

      maxSpeed:
        form.maxSpeed === ""
          ? 0
          : Number(form.maxSpeed),

      maxAltitude:
        form.maxAltitude === ""
          ? 0
          : Number(form.maxAltitude),
=======
      fuelCapacity: Number(form.fuelCapacity),
      maxSpeed: Number(form.maxSpeed),
      maxAltitude: Number(form.maxAltitude),
>>>>>>> origin/develop
    };

    try {
      if (editingId) {
        await updateAircraft(editingId, payload);

<<<<<<< HEAD
        setMessage(
          "Aircraft updated successfully."
        );
      } else {
        await createAircraft(payload);

        setMessage(
          "Aircraft added successfully."
        );
=======
        setMessage("Aircraft updated successfully.");
      } else {
        await createAircraft(payload);

        setMessage("Aircraft added successfully.");
>>>>>>> origin/develop
      }

      resetForm();

      await loadAircraft();
    } catch (err) {
      console.error(err);

<<<<<<< HEAD
      setError(
        "Unable to save aircraft. Check the registration number and input values."
      );
=======
      const backendError =
        err.response?.data?.error ||
        "Unable to save aircraft. Check the registration number and input values.";

      setError(backendError);
>>>>>>> origin/develop
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
<<<<<<< HEAD
      registrationNumber:
        item.registrationNumber ?? "",

      model:
        item.model ?? "",

      manufacturer:
        item.manufacturer ?? "",

      status:
        item.status ?? "AVAILABLE",

      fuelCapacity:
        item.fuelCapacity ?? "",

      maxSpeed:
        item.maxSpeed ?? "",

      maxAltitude:
        item.maxAltitude ?? "",
=======
      registrationNumber: item.registrationNumber ?? "",
      model: item.model ?? "",
      manufacturer: item.manufacturer ?? "",
      status: item.status ?? "AVAILABLE",
      fuelCapacity: item.fuelCapacity ?? "",
      maxSpeed: item.maxSpeed ?? "",
      maxAltitude: item.maxAltitude ?? "",
>>>>>>> origin/develop
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this aircraft?"
    );

    if (!confirmed) {
      return;
    }

    try {
<<<<<<< HEAD
      await deleteAircraft(id);

      setMessage(
        "Aircraft deleted successfully."
      );
=======
      setMessage("");
      setError("");

      await deleteAircraft(id);

      setMessage("Aircraft deleted successfully.");
>>>>>>> origin/develop

      await loadAircraft();
    } catch (err) {
      console.error(err);

<<<<<<< HEAD
      setError(
        "Unable to delete aircraft."
      );
=======
      const backendError =
        err.response?.data?.error ||
        "Unable to delete aircraft.";

      setError(backendError);
>>>>>>> origin/develop
    }
  };

  return (
    <div className="aircraft-page">
<<<<<<< HEAD

=======
>>>>>>> origin/develop
      <div className="page-header">
        <div>
          <h1>Aircraft Management</h1>

          <p>
<<<<<<< HEAD
            Manage aircraft available for flight
            simulation and monitoring.
=======
            Manage aircraft available for flight simulation and monitoring.
>>>>>>> origin/develop
          </p>
        </div>

        <div className="aircraft-count">
          {aircraft.length} Aircraft
        </div>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <section className="management-card">
<<<<<<< HEAD

=======
>>>>>>> origin/develop
        <div className="management-card-header">
          <h2>
            {editingId
              ? "Update Aircraft"
              : "Register Aircraft"}
          </h2>
        </div>

        <form
          className="aircraft-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>
              Registration Number
            </label>

            <input
              type="text"
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              placeholder="4R-ABC"
              required
            />
          </div>

          <div className="form-group">
            <label>Model</label>

            <input
              type="text"
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="Airbus A320"
              required
            />
          </div>

          <div className="form-group">
            <label>Manufacturer</label>

            <input
              type="text"
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              placeholder="Airbus"
<<<<<<< HEAD
=======
              required
>>>>>>> origin/develop
            />
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
<<<<<<< HEAD
=======
              required
>>>>>>> origin/develop
            >
              <option value="AVAILABLE">
                Available
              </option>

              <option value="IN_FLIGHT">
                In Flight
              </option>

              <option value="MAINTENANCE">
                Maintenance
              </option>

<<<<<<< HEAD
              <option value="GROUNDED">
                Grounded
=======
              <option value="OUT_OF_SERVICE">
                Out of Service
>>>>>>> origin/develop
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Fuel Capacity (L)
            </label>

            <input
              type="number"
<<<<<<< HEAD
              min="0"
=======
              min="1"
>>>>>>> origin/develop
              name="fuelCapacity"
              value={form.fuelCapacity}
              onChange={handleChange}
              placeholder="24210"
<<<<<<< HEAD
=======
              required
>>>>>>> origin/develop
            />
          </div>

          <div className="form-group">
            <label>
              Maximum Speed (km/h)
            </label>

            <input
              type="number"
<<<<<<< HEAD
              min="0"
=======
              min="1"
>>>>>>> origin/develop
              name="maxSpeed"
              value={form.maxSpeed}
              onChange={handleChange}
              placeholder="871"
<<<<<<< HEAD
=======
              required
>>>>>>> origin/develop
            />
          </div>

          <div className="form-group">
            <label>
              Maximum Altitude (ft)
            </label>

            <input
              type="number"
<<<<<<< HEAD
              min="0"
=======
              min="1"
>>>>>>> origin/develop
              name="maxAltitude"
              value={form.maxAltitude}
              onChange={handleChange}
              placeholder="39800"
<<<<<<< HEAD
=======
              required
>>>>>>> origin/develop
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-btn"
            >
              {editingId
                ? "Update Aircraft"
                : "Add Aircraft"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
<<<<<<< HEAD

=======
>>>>>>> origin/develop
        </form>
      </section>

      <section className="management-card">
<<<<<<< HEAD

=======
>>>>>>> origin/develop
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
<<<<<<< HEAD

            <table className="aircraft-table">

=======
            <table className="aircraft-table">
>>>>>>> origin/develop
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Registration</th>
                  <th>Model</th>
                  <th>Manufacturer</th>
                  <th>Status</th>
<<<<<<< HEAD
=======
                  <th>Fuel Capacity</th>
>>>>>>> origin/develop
                  <th>Max Speed</th>
                  <th>Max Altitude</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
<<<<<<< HEAD

                {aircraft.map((item) => (
                  <tr key={item.id}>

=======
                {aircraft.map((item) => (
                  <tr key={item.id}>
>>>>>>> origin/develop
                    <td>{item.id}</td>

                    <td>
                      {item.registrationNumber}
                    </td>

                    <td>{item.model}</td>

                    <td>
                      {item.manufacturer}
                    </td>

                    <td>
                      <span
                        className={`aircraft-status ${
                          item.status
                            ?.toLowerCase()
<<<<<<< HEAD
                            .replace("_", "-")
=======
                            .replace(/_/g, "-")
>>>>>>> origin/develop
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
<<<<<<< HEAD
=======
                      {item.fuelCapacity} L
                    </td>

                    <td>
>>>>>>> origin/develop
                      {item.maxSpeed} km/h
                    </td>

                    <td>
                      {item.maxAltitude} ft
                    </td>

                    <td>
                      <div className="table-actions">
<<<<<<< HEAD

=======
>>>>>>> origin/develop
                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(item)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                        >
                          Delete
                        </button>
<<<<<<< HEAD

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}
      </section>

=======
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
>>>>>>> origin/develop
    </div>
  );
};

export default AircraftPage;