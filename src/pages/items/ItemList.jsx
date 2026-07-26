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

export default function ItemList() {
  const { page, limit, nextPage, prevPage, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const debouncedSearch = useDebounce(search);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", type: "weapon", power: 10, description: "" });
  const [formErrors, setFormErrors] = useState({});
  const toast = useToast();

  const params = useMemo(
    () => ({ page, limit, ...(debouncedSearch && { search: debouncedSearch }), ...(type && { type }) }),
    [page, limit, debouncedSearch, type]
  );

  const { data, loading, error, refetch } = useFetch("items", params);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      await api.create("items", form);
      setShowCreate(false);
      setForm({ name: "", type: "weapon", power: 10, description: "" });
      refetch();
      toast.success("Item created");
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-bold text-foreground">Items</h1>
        <Button onClick={() => setShowCreate(true)}>+ New Item</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); reset(); }}
          className="sm:w-64"
        />
        <Select
          value={type}
          onChange={(e) => { setType(e.target.value); reset(); }}
          options={[
            { value: "", label: "All types" },
            { value: "weapon", label: "Weapon" },
            { value: "armor", label: "Armor" },
            { value: "potion", label: "Potion" },
            { value: "ring", label: "Ring" },
          ]}
        />
      </div>

      {loading && <SkeletonTable rows={8} cols={4} />}
      {error && <p className="text-destructive text-center py-8">{error}</p>}
      {!loading && !error && data?.data.length === 0 && <EmptyState message="No items found" />}

      {!loading && !error && data?.data.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Power</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to={`/items/${item.id}`} className="text-foreground hover:text-primary font-medium">
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <Badge variant="default">{item.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{item.power}</td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPrev={prevPage} onNext={nextPage} onGoTo={goToPage} />
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Item">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Name" placeholder="Flame Tongue" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name?.[0]} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[{ value: "weapon", label: "Weapon" }, { value: "armor", label: "Armor" }, { value: "potion", label: "Potion" }, { value: "ring", label: "Ring" }]} />
          <Input label="Power" type="number" value={form.power} onChange={(e) => setForm({ ...form, power: +e.target.value })} error={formErrors.power?.[0]} />
          <Input label="Description" placeholder="A magical sword..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={formErrors.description?.[0]} />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
