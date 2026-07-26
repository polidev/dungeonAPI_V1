import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { api } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import Button from "../../components/ui/Button.jsx";
import { SkeletonDetail } from "../../components/ui/Skeleton.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: "", type: "weapon", power: 10, description: "" });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get("items", id)
      .then(setItem)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      const updated = await api.update("items", id, form);
      setItem(updated);
      setShowEdit(false);
      toast.success("Item updated");
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.remove("items", id);
      toast.success("Item deleted");
      navigate("/items");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <SkeletonDetail />;
  if (error || !item) return <p className="text-destructive text-center py-8">{error || "Item not found"}</p>;

  const openEdit = () => {
    setForm({ name: item.name, type: item.type, power: item.power, description: item.description });
    setShowEdit(true);
  };

  return (
    <div>
      <Link to="/items" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
        &larr; Back to items
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-foreground mb-1">{item.name}</h1>
          <p className="text-muted-foreground capitalize">{item.type} &middot; Power {item.power}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={openEdit}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card mb-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Description</h2>
        <p className="text-foreground">{item.description}</p>
      </div>

      {item.inventories?.length > 0 && (
        <>
          <h2 className="font-semibold text-foreground mb-4">
            Owned by ({item.inventories.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {item.inventories.map((inv) => (
              <Link
                key={inv.id}
                to={`/characters/${inv.characterId}`}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <span className="font-medium text-foreground">{inv.character.name}</span>
                <span className="text-xs text-muted-foreground">x{inv.quantity}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Item">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name?.[0]} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[{ value: "weapon", label: "Weapon" }, { value: "armor", label: "Armor" }, { value: "potion", label: "Potion" }, { value: "ring", label: "Ring" }]} />
          <Input label="Power" type="number" value={form.power} onChange={(e) => setForm({ ...form, power: +e.target.value })} error={formErrors.power?.[0]} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={formErrors.description?.[0]} />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
