import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { api } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import { SkeletonDetail } from "../../components/ui/Skeleton.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";

const difficultyColors = { easy: "success", medium: "warning", hard: "destructive", boss: "primary" };

export default function DungeonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [dungeon, setDungeon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", difficulty: "easy" });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get("dungeons", id)
      .then(setDungeon)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      const updated = await api.update("dungeons", id, form);
      setDungeon(updated);
      setShowEdit(false);
      toast.success("Dungeon updated");
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this dungeon and all its monsters?")) return;
    try {
      await api.remove("dungeons", id);
      toast.success("Dungeon deleted");
      navigate("/dungeons");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <SkeletonDetail />;
  if (error || !dungeon) return <p className="text-destructive text-center py-8">{error || "Dungeon not found"}</p>;

  const openEdit = () => {
    setForm({ name: dungeon.name, description: dungeon.description, difficulty: dungeon.difficulty });
    setShowEdit(true);
  };

  return (
    <div>
      <Link to="/dungeons" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
        &larr; Back to dungeons
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-bold text-foreground">{dungeon.name}</h1>
            <Badge variant={difficultyColors[dungeon.difficulty]}>{dungeon.difficulty}</Badge>
          </div>
          <p className="text-muted-foreground">{dungeon.description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={openEdit}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      <h2 className="font-semibold text-foreground mb-4">
        Monsters ({dungeon.monsters?.length || 0})
      </h2>

      {dungeon.monsters?.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">HP</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">ATK</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">DEF</th>
              </tr>
            </thead>
            <tbody>
              {dungeon.monsters.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link to={`/monsters/${m.id}`} className="text-foreground hover:text-primary font-medium">
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{m.type}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{m.health}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{m.attack}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{m.defense}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted-foreground py-4">No monsters in this dungeon.</p>
      )}

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Dungeon">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name?.[0]} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={formErrors.description?.[0]} />
          <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            options={[{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }, { value: "boss", label: "Boss" }]} />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
