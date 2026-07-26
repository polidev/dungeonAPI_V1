import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { api } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import Button from "../../components/ui/Button.jsx";
import { SkeletonDetail, SkeletonStats } from "../../components/ui/Skeleton.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";

export default function MonsterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [monster, setMonster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [dungeons, setDungeons] = useState([]);
  const [form, setForm] = useState({ name: "", type: "beast", health: 50, attack: 10, defense: 5, dungeonId: "" });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get("monsters", id)
      .then(setMonster)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      const updated = await api.update("monsters", id, form);
      setMonster(updated);
      setShowEdit(false);
      toast.success("Monster updated");
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this monster?")) return;
    try {
      await api.remove("monsters", id);
      toast.success("Monster deleted");
      navigate("/monsters");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div><SkeletonDetail /><SkeletonStats /></div>;
  if (error || !monster) return <p className="text-destructive text-center py-8">{error || "Monster not found"}</p>;

  const openEdit = async () => {
    const res = await api.list("dungeons", { limit: 100 });
    setDungeons(res.data);
    setForm({ name: monster.name, type: monster.type, health: monster.health, attack: monster.attack, defense: monster.defense, dungeonId: monster.dungeonId });
    setShowEdit(true);
  };

  const stats = [
    { label: "Health", value: monster.health, color: "text-green-500" },
    { label: "Attack", value: monster.attack, color: "text-red-500" },
    { label: "Defense", value: monster.defense, color: "text-blue-500" },
  ];

  return (
    <div>
      <Link to="/monsters" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
        &larr; Back to monsters
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{monster.name}</h1>
          <p className="text-muted-foreground capitalize">
            {monster.type} &middot; in{" "}
            <Link to={`/dungeons/${monster.dungeonId}`} className="text-primary hover:underline">
              {monster.dungeon?.name}
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={openEdit}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Monster">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name?.[0]} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[{ value: "beast", label: "Beast" }, { value: "undead", label: "Undead" }, { value: "demon", label: "Demon" }, { value: "elemental", label: "Elemental" }, { value: "dragon", label: "Dragon" }]} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="HP" type="number" value={form.health} onChange={(e) => setForm({ ...form, health: +e.target.value })} error={formErrors.health?.[0]} />
            <Input label="ATK" type="number" value={form.attack} onChange={(e) => setForm({ ...form, attack: +e.target.value })} error={formErrors.attack?.[0]} />
            <Input label="DEF" type="number" value={form.defense} onChange={(e) => setForm({ ...form, defense: +e.target.value })} error={formErrors.defense?.[0]} />
          </div>
          <Select label="Dungeon" value={form.dungeonId} onChange={(e) => setForm({ ...form, dungeonId: e.target.value })}
            options={dungeons.map((d) => ({ value: d.id, label: d.name }))} />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
