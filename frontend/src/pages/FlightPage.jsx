import { useEffect, useState } from "react";

import {
  getAllFlights,
  createFlight,
  updateFlight,
  startFlight,
  completeFlight,
  cancelFlight,
  deleteFlight,
} from "../services/flightService";

import {
  getAllAircraft,
} from "../services/aircraftService";

const emptyForm = {
  flightNumber: "",
  departure: "",
  destination: "",
  scheduledTime: "",
  aircraftId: "",
};

const FlightPage = () => {
  const [flights, setFlights] = useState([]);
  const [aircraft, setAircraft] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        flightData,
        aircraftData,
      ] = await Promise.all([
        getAllFlights(),
        getAllAircraft(),
      ]);

      setFlights(flightData);
      setAircraft(aircraftData);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load flight data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

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

    if (!form.aircraftId) {
      setError(
        "Please select an aircraft."
      );

      return;
    }

    const payload = {
      flightNumber:
        form.flightNumber,

      departure:
        form.departure,

      destination:
        form.destination,

      scheduledTime:
        form.scheduledTime
          ? `${form.scheduledTime}:00`
          : null,
    };

    try {
      if (editingId) {
        await updateFlight(
          editingId,
          payload,
          form.aircraftId
        );

        setMessage(
          "Flight updated successfully."
        );
      } else {
        await createFlight(
          payload,
          form.aircraftId
        );

        setMessage(
          "Flight scheduled successfully."
        );
      }

      resetForm();

      await loadData();
    } catch (err) {
      console.error(err);

      const backendMessage =
        err.response?.data?.message;

      setError(
        backendMessage ||
          "Unable to save flight."
      );
    }
  };

  const handleEdit = (flight) => {
    setEditingId(flight.id);

    let scheduledTime = "";

    if (flight.scheduledTime) {
      scheduledTime =
        flight.scheduledTime.slice(
          0,
          16
        );
    }

    setForm({
      flightNumber:
        flight.flightNumber ?? "",

      departure:
        flight.departure ?? "",

      destination:
        flight.destination ?? "",

      scheduledTime,

      aircraftId:
        flight.aircraft?.id ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleStart = async (id) => {
    try {
      await startFlight(id);

      setMessage(
        "Flight started."
      );

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to start flight."
      );
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeFlight(id);

      setMessage(
        "Flight completed."
      );

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to complete flight."
      );
    }
  };

  const handleCancel = async (id) => {
    const confirmed =
      window.confirm(
        "Cancel this flight?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await cancelFlight(id);

      setMessage(
        "Flight cancelled."
      );

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to cancel flight."
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Delete this flight?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFlight(id);

      setMessage(
        "Flight deleted."
      );

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to delete flight."
      );
    }
  };

  return (
    <div className="flight-page">

      <div className="page-header">
        <div>
          <h1>
            Flight Management
          </h1>

          <p>
            Schedule, start, monitor
            and complete aircraft
            simulation flights.
          </p>
        </div>

        <div className="aircraft-count">
          {flights.length} Flights
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

        <div className="management-card-header">
          <h2>
            {editingId
              ? "Update Flight"
              : "Schedule Flight"}
          </h2>
        </div>

        <form
          className="aircraft-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Flight Number
            </label>

            <input
              type="text"
              name="flightNumber"
              value={
                form.flightNumber
              }
              onChange={handleChange}
              placeholder="FS-001"
              required
            />

          </div>

          <div className="form-group">

            <label>
              Departure
            </label>

            <input
              type="text"
              name="departure"
              value={
                form.departure
              }
              onChange={handleChange}
              placeholder="Colombo"
              required
            />

          </div>

          <div className="form-group">

            <label>
              Destination
            </label>

            <input
              type="text"
              name="destination"
              value={
                form.destination
              }
              onChange={handleChange}
              placeholder="Dubai"
              required
            />

          </div>

          <div className="form-group">

            <label>
              Scheduled Time
            </label>

            <input
              type="datetime-local"
              name="scheduledTime"
              value={
                form.scheduledTime
              }
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Aircraft
            </label>

            <select
              name="aircraftId"
              value={
                form.aircraftId
              }
              onChange={handleChange}
              required
            >

              <option value="">
                Select Aircraft
              </option>

              {aircraft.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {
                    item.registrationNumber
                  }
                  {" - "}
                  {item.model}
                  {" ("}
                  {item.status}
                  {")"}
                </option>
              ))}

            </select>

          </div>

          <div className="form-actions">

            <button
              className="primary-btn"
              type="submit"
            >
              {editingId
                ? "Update Flight"
                : "Schedule Flight"}
            </button>

            {editingId && (
              <button
                className="secondary-btn"
                type="button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>

      </section>

      <section className="management-card">

        <div className="management-card-header">
          <h2>
            Flight Operations
          </h2>
        </div>

        {loading ? (
          <p>
            Loading flights...
          </p>
        ) : flights.length === 0 ? (
          <div className="empty-state">
            No flights scheduled.
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="aircraft-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Flight</th>
                  <th>Aircraft</th>
                  <th>Route</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {flights.map((flight) => (

                  <tr key={flight.id}>

                    <td>
                      {flight.id}
                    </td>

                    <td>
                      {
                        flight.flightNumber
                      }
                    </td>

                    <td>
                      {
                        flight.aircraft
                          ?.registrationNumber
                      }
                    </td>

                    <td>
                      {flight.departure}
                      {" → "}
                      {
                        flight.destination
                      }
                    </td>

                    <td>
                      {flight.scheduledTime
                        ? new Date(
                            flight.scheduledTime
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td>
                      <span
                        className={`aircraft-status ${
                          flight.status
                            ?.toLowerCase()
                            .replaceAll(
                              "_",
                              "-"
                            )
                        }`}
                      >
                        {flight.status}
                      </span>
                    </td>

                    <td>

                      <div className="table-actions">

                        {flight.status ===
                          "SCHEDULED" && (
                          <>
                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(
                                  flight
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="start-btn"
                              onClick={() =>
                                handleStart(
                                  flight.id
                                )
                              }
                            >
                              Start
                            </button>

                            <button
                              className="cancel-btn"
                              onClick={() =>
                                handleCancel(
                                  flight.id
                                )
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {flight.status ===
                          "IN_PROGRESS" && (
                          <button
                            className="complete-btn"
                            onClick={() =>
                              handleComplete(
                                flight.id
                              )
                            }
                          >
                            Complete
                          </button>
                        )}

                        {flight.status !==
                          "IN_PROGRESS" && (
                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                flight.id
                              )
                            }
                          >
                            Delete
                          </button>
                        )}

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
};

export default FlightPage;