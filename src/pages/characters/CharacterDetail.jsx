import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { api } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import { SkeletonDetail, SkeletonStats } from "../../components/ui/Skeleton.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";

export default function CharacterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: "", class: "warrior", health: 100, attack: 15, defense: 10 });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get("characters", id)
      .then(setCharacter)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      const updated = await api.update("characters", id, form);
      setCharacter(updated);
      setShowEdit(false);
      toast.success("Character updated");
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this character and their inventory?")) return;
    try {
      await api.remove("characters", id);
      toast.success("Character deleted");
      navigate("/characters");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div><SkeletonDetail /><SkeletonStats /></div>;
  if (error || !character) return <p className="text-destructive text-center py-8">{error || "Character not found"}</p>;

  const openEdit = () => {
    setForm({ name: character.name, class: character.class, health: character.health, attack: character.attack, defense: character.defense });
    setShowEdit(true);
  };

  const stats = [
    { label: "Health", value: character.health, color: "text-green-500" },
    { label: "Attack", value: character.attack, color: "text-red-500" },
    { label: "Defense", value: character.defense, color: "text-blue-500" },
  ];

  return (
    <div>
      <Link to="/characters" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
        &larr; Back to characters
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-bold text-foreground">{character.name}</h1>
            <Badge variant="primary">Level {character.level}</Badge>
          </div>
          <p className="text-muted-foreground capitalize">{character.class}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={openEdit}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-foreground mb-4">
        Inventory ({character.inventories?.length || 0})
      </h2>

      {character.inventories?.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {character.inventories.map((inv) => (
            <Link
              key={inv.id}
              to={`/items/${inv.itemId}`}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{inv.item.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{inv.item.type} &middot; Power {inv.item.power}</p>
              </div>
              <span className="text-xs text-muted-foreground">x{inv.quantity}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-4">No items in inventory.</p>
      )}

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Character">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name?.[0]} />
          <Select label="Class" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}
            options={[{ value: "warrior", label: "Warrior" }, { value: "mage", label: "Mage" }, { value: "rogue", label: "Rogue" }, { value: "ranger", label: "Ranger" }]} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input label="HP" type="number" value={form.health} onChange={(e) => setForm({ ...form, health: +e.target.value })} error={formErrors.health?.[0]} />
            <Input label="ATK" type="number" value={form.attack} onChange={(e) => setForm({ ...form, attack: +e.target.value })} error={formErrors.attack?.[0]} />
            <Input label="DEF" type="number" value={form.defense} onChange={(e) => setForm({ ...form, defense: +e.target.value })} error={formErrors.defense?.[0]} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
