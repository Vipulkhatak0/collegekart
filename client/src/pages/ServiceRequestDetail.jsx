import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";
import useAuth from "../context/AuthContext.jsx";

export default function ServiceRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ price: "", message: "" });
  const [submittingBid, setSubmittingBid] = useState(false);

  const fetchData = () => {
    api.get(`/service-requests/${id}`)
      .then((res) => {
        setRequest(res.data.request);
        setBids(res.data.bids || []);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const isOwner = user && request && String(user.id) === String(request.buyer?._id);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBid(true);
    try {
      await api.post(`/service-requests/${id}/bids`, bidForm);
      toast.success("Bid placed!");
      setBidForm({ price: "", message: "" });
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAccept = async (bidId) => {
    try {
      await api.put(`/service-requests/${id}/bids/${bidId}/accept`);
      toast.success("Bid accepted!");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleComplete = async () => {
    try {
      await api.put(`/service-requests/${id}/complete`);
      toast.success("Marked as completed.");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleClose = async () => {
    if (!window.confirm("Close this request? It will stop accepting new bids.")) return;
    try {
      await api.put(`/service-requests/${id}/close`);
      toast.success("Request closed.");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this request? This cannot be undone.")) return;
    try {
      await api.delete(`/service-requests/${id}`);
      toast.success("Request deleted.");
      navigate("/services");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!request) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">Request not found.</div>;

  const statusColors = {
    open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    assigned: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    closed: "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="rounded-full bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-primary-400 text-xs font-semibold px-2.5 py-1 capitalize">
            {request.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[request.status]}`}>
            {request.status}
          </span>
        </div>

        <h1 className="mt-3 font-display text-xl font-bold text-slate-800 dark:text-white">
          {request.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{request.description}</p>

        <div className="flex gap-4 flex-wrap mt-4 text-xs text-slate-400 dark:text-slate-500">
          {request.budget && <span>Budget: ₹{request.budget}</span>}
          {request.deadline && <span>Deadline: {new Date(request.deadline).toLocaleDateString()}</span>}
          <span>Posted by {request.buyer?.name}</span>
        </div>

        {request.contactInfo && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Contact:</span> {request.contactInfo}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {!isOwner && (
            <button
              onClick={() => navigate(`/chat?with=${request.buyer._id}&service=${request._id}`)}
              className="rounded-full border border-primary-500 text-primary-600 dark:text-primary-400 px-4 py-2 text-sm font-semibold"
            >
              Message {request.buyer?.name}
            </button>
          )}

          {isOwner && request.status === "assigned" && (
            <button
              onClick={handleComplete}
              className="rounded-full bg-emerald-500 text-white px-5 py-2 text-sm font-semibold"
            >
              Mark as Completed
            </button>
          )}

          {isOwner && request.status === "open" && (
            <button
              onClick={() => navigate(`/services/${id}/edit`)}
              className="rounded-full border border-slate-400 text-slate-600 dark:text-slate-300 px-5 py-2 text-sm font-semibold"
            >
              Edit
            </button>
          )}

          {isOwner && (request.status === "open" || request.status === "assigned") && (
            <button
              onClick={handleClose}
              className="rounded-full border border-slate-400 text-slate-600 dark:text-slate-300 px-5 py-2 text-sm font-semibold"
            >
              Close Request
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              className="rounded-full border border-red-400 text-red-500 px-5 py-2 text-sm font-semibold"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold text-slate-800 dark:text-white">
        Bids ({bids.length})
      </h2>

      <div className="mt-3 space-y-3">
        {bids.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No bids yet.</p>
        )}
        {bids.map((bid) => (
          <div
            key={bid._id}
            className={`rounded-xl border p-4 ${
              bid.status === "accepted"
                ? "border-emerald-300 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5"
                : "border-slate-200 dark:border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-white">{bid.provider?.name}</span>
              <span className="font-bold text-primary-600 dark:text-primary-400">₹{bid.price}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{bid.message}</p>
            {bid.status === "accepted" && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                ✓ Accepted
              </span>
            )}
            {isOwner && (
              <div className="mt-2 flex gap-2">
                {request.status === "open" && bid.status === "pending" && (
                  <button
                    onClick={() => handleAccept(bid._id)}
                    className="rounded-full bg-brand-gradient text-white px-4 py-1.5 text-xs font-semibold"
                  >
                    Accept this bid
                  </button>
                )}
                <button
                  onClick={() => navigate(`/chat?with=${bid.provider._id}&service=${request._id}`)}
                  className="rounded-full border border-primary-500 text-primary-600 dark:text-primary-400 px-4 py-1.5 text-xs font-semibold"
                >
                  Chat
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isOwner && request.status === "open" && (
        <form onSubmit={handleBidSubmit} className="mt-6 rounded-2xl border border-slate-200 dark:border-white/10 p-4 space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">Place a Bid</h3>
          <input
            type="number"
            min="0"
            placeholder="Your price (₹)"
            value={bidForm.price}
            onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-white/5 dark:border-white/10 dark:text-white"
            required
          />
          <textarea
            placeholder="Message (e.g. your experience, turnaround time)"
            value={bidForm.message}
            onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-white/5 dark:border-white/10 dark:text-white"
            rows={2}
            required
          />
          <button
            type="submit"
            disabled={submittingBid}
            className="w-full rounded-full bg-brand-gradient text-white py-2.5 font-semibold disabled:opacity-50"
          >
            {submittingBid ? "Submitting..." : "Submit Bid"}
          </button>
        </form>
      )}
    </div>
  );
}