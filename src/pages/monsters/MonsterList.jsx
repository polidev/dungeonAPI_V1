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
import { SkeletonTable } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Select from "../../components/ui/Select.jsx";

export default function MonsterList() {
  const { page, limit, nextPage, prevPage, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const debouncedSearch = useDebounce(search);
  const [showCreate, setShowCreate] = useState(false);
  const [dungeons, setDungeons] = useState([]);
  const [form, setForm] = useState({ name: "", type: "beast", health: 50, attack: 10, defense: 5, dungeonId: "" });
  const [formErrors, setFormErrors] = useState({});
  const toast = useToast();

  const params = useMemo(
    () => ({ page, limit, ...(debouncedSearch && { search: debouncedSearch }), ...(type && { type }) }),
    [page, limit, debouncedSearch, type]
  );

  const { data, loading, error, refetch } = useFetch("monsters", params);

  const openCreate = async () => {
    const res = await api.list("dungeons", { limit: 100 });
    setDungeons(res.data);
    setForm({ name: "", type: "beast", health: 50, attack: 10, defense: 5, dungeonId: res.data[0]?.id || "" });
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      await api.create("monsters", form);
      setShowCreate(false);
      refetch();
      toast.success("Monster created");
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Monsters</h1>
        <Button onClick={openCreate}>+ New Monster</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search monsters..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); reset(); }}
          className="sm:w-64"
        />
        <Select
          value={type}
          onChange={(e) => { setType(e.target.value); reset(); }}
          options={[
            { value: "", label: "All types" },
            { value: "beast", label: "Beast" },
            { value: "undead", label: "Undead" },
            { value: "demon", label: "Demon" },
            { value: "elemental", label: "Elemental" },
            { value: "dragon", label: "Dragon" },
          ]}
        />
      </div>

      {loading && <SkeletonTable rows={8} cols={6} />}
      {error && <p className="text-destructive text-center py-8">{error}</p>}
      {!loading && !error && data?.data.length === 0 && <EmptyState message="No monsters found" />}

      {!loading && !error && data?.data.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dungeon</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">HP</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">ATK</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">DEF</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to={`/monsters/${m.id}`} className="text-foreground hover:text-primary font-medium">
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <Badge variant="default">{m.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.dungeon?.name}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{m.health}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{m.attack}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{m.defense}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPrev={prevPage} onNext={nextPage} onGoTo={goToPage} />
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Monster">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Name" placeholder="Fire Drake" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name?.[0]} />
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
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
