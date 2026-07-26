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

export default function CharacterList() {
  const { page, limit, nextPage, prevPage, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [cls, setCls] = useState("");
  const debouncedSearch = useDebounce(search);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", class: "warrior", health: 100, attack: 15, defense: 10 });
  const [formErrors, setFormErrors] = useState({});
  const toast = useToast();

  const params = useMemo(
    () => ({ page, limit, ...(debouncedSearch && { search: debouncedSearch }), ...(cls && { class: cls }) }),
    [page, limit, debouncedSearch, cls]
  );

  const { data, loading, error, refetch } = useFetch("characters", params);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      await api.create("characters", form);
      setShowCreate(false);
      setForm({ name: "", class: "warrior", health: 100, attack: 15, defense: 10 });
      refetch();
      toast.success("Character created");
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-bold text-foreground">Characters</h1>
        <Button onClick={() => setShowCreate(true)}>+ New Character</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search characters..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); reset(); }}
          className="sm:w-64"
        />
        <Select
          value={cls}
          onChange={(e) => { setCls(e.target.value); reset(); }}
          options={[
            { value: "", label: "All classes" },
            { value: "warrior", label: "Warrior" },
            { value: "mage", label: "Mage" },
            { value: "rogue", label: "Rogue" },
            { value: "ranger", label: "Ranger" },
          ]}
        />
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {error && <p className="text-destructive text-center py-8">{error}</p>}
      {!loading && !error && data?.data.length === 0 && <EmptyState message="No characters found" />}

      {!loading && !error && data?.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.data.map((c) => (
              <Link
                key={c.id}
                to={`/characters/${c.id}`}
                className="block p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <Badge variant="primary">Lv.{c.level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground capitalize mb-3">{c.class}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">HP</p>
                    <p className="text-sm font-medium text-green-500">{c.health}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ATK</p>
                    <p className="text-sm font-medium text-red-500">{c.attack}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">DEF</p>
                    <p className="text-sm font-medium text-blue-500">{c.defense}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{c._count.inventories} items</p>
              </Link>
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPrev={prevPage} onNext={nextPage} onGoTo={goToPage} />
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Character">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Name" placeholder="Aldric" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name?.[0]} />
          <Select label="Class" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}
            options={[{ value: "warrior", label: "Warrior" }, { value: "mage", label: "Mage" }, { value: "rogue", label: "Rogue" }, { value: "ranger", label: "Ranger" }]} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input label="HP" type="number" value={form.health} onChange={(e) => setForm({ ...form, health: +e.target.value })} error={formErrors.health?.[0]} />
            <Input label="ATK" type="number" value={form.attack} onChange={(e) => setForm({ ...form, attack: +e.target.value })} error={formErrors.attack?.[0]} />
            <Input label="DEF" type="number" value={form.defense} onChange={(e) => setForm({ ...form, defense: +e.target.value })} error={formErrors.defense?.[0]} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
