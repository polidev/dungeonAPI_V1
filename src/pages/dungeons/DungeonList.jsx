import { useState, useMemo } from "react";
import { Link } from "react-router";
import { api } from "../../api/client.js";
import { useFetch } from "../../hooks/useFetch.js";
import { usePagination } from "../../hooks/usePagination.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { useToast } from "../../context/ToastContext.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { SkeletonCard } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Select from "../../components/ui/Select.jsx";

const difficultyColors = { easy: "success", medium: "warning", hard: "destructive", boss: "primary" };

export default function DungeonList() {
  const { page, limit, nextPage, prevPage, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const debouncedSearch = useDebounce(search);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", difficulty: "easy" });
  const [formErrors, setFormErrors] = useState({});
  const toast = useToast();

  const params = useMemo(
    () => ({ page, limit, ...(debouncedSearch && { search: debouncedSearch }), ...(difficulty && { difficulty }) }),
    [page, limit, debouncedSearch, difficulty]
  );

  const { data, loading, error, refetch } = useFetch("dungeons", params);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      await api.create("dungeons", form);
      setShowCreate(false);
      setForm({ name: "", description: "", difficulty: "easy" });
      refetch();
      toast.success("Dungeon created");
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-bold text-foreground">Dungeons</h1>
        <Button onClick={() => setShowCreate(true)}>+ New Dungeon</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search dungeons..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); reset(); }}
          className="sm:w-64"
        />
        <Select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); reset(); }}
          options={[
            { value: "", label: "All difficulties" },
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
            { value: "boss", label: "Boss" },
          ]}
        />
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {error && <p className="text-destructive text-center py-8">{error}</p>}
      {!loading && !error && data?.data.length === 0 && <EmptyState message="No dungeons found" />}

      {!loading && !error && data?.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((d) => (
              <Link
                key={d.id}
                to={`/dungeons/${d.id}`}
                className="block p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{d.name}</h3>
                  <Badge variant={difficultyColors[d.difficulty]}>{d.difficulty}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{d.description}</p>
                <p className="text-xs text-muted-foreground">{d._count.monsters} monsters</p>
              </Link>
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPrev={prevPage}
            onNext={nextPage}
            onGoTo={goToPage}
          />
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Dungeon">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="Goblin Warrens"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={formErrors.name?.[0]}
          />
          <Input
            label="Description"
            placeholder="A damp network of tunnels..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={formErrors.description?.[0]}
          />
          <Select
            label="Difficulty"
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            options={[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
              { value: "boss", label: "Boss" },
            ]}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
