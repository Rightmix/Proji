import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import { PageTitle } from '../../components/account/AccountLayout'
import { SelectField, TextField } from '../../components/account/FormField'
import { focusFirstInvalid } from '../../lib/focus'
import { ErrorState, Loading, Unavailable } from '../../components/account/States'
import { useAccountRepository } from '../../features/account/accountContext'
import { asAccountError, useResource } from '../../features/account/useResource'
import {
  COUNTRIES,
  UUID_RE,
  emptyAddress,
  validateAddress,
  type FieldErrors,
} from '../../features/account/validation'
import {
  ADDRESS_LABELS,
  AccountError,
  type Address,
  type AddressInput,
} from '../../features/account/types'

const LABEL = { home: 'Home', work: 'Work', other: 'Other' } as const

function AddressForm({ initial, existing }: { initial: AddressInput; existing: Address | null }) {
  const repo = useAccountRepository()!
  const navigate = useNavigate()
  const form = useRef<HTMLFormElement>(null)
  const [v, setV] = useState<AddressInput>(initial)
  const [makeDefault, setMakeDefault] = useState(false)
  const [errors, setErrors] = useState<FieldErrors<AddressInput>>({})
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<AccountError | null>(null)
  const c = COUNTRIES.find((x) => x.code === v.countryCode) ?? COUNTRIES[0]
  const set =
    <K extends keyof AddressInput>(k: K) =>
    (value: AddressInput[K]) =>
      setV((p) => ({ ...p, [k]: value }))
  const text = (k: keyof AddressInput) => ({
    name: k,
    value: (v[k] as string | null) ?? '',
    error: errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k)(e.target.value as never),
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validateAddress(v)
    setErrors(errs)
    if (Object.keys(errs).length)
      return requestAnimationFrame(() => focusFirstInvalid(form.current))
    setBusy(true)
    setFailure(null)
    try {
      if (existing) {
        await repo.updateAddress(existing.id, v)
        if (makeDefault) await repo.setDefaultAddress(existing.id)
      } else await repo.createAddress({ ...v, isDefault: makeDefault })
      navigate('/account/addresses', {
        state: { message: existing ? 'Address updated.' : 'Address added.' },
      })
    } catch (err) {
      setFailure(asAccountError(err))
      setBusy(false)
    }
  }

  return (
    <form ref={form} noValidate onSubmit={submit} className="mt-6 flex max-w-xl flex-col gap-4">
      <fieldset>
        <legend className="text-sm font-medium">Label</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {ADDRESS_LABELS.map((l) => (
            <label
              key={l}
              className="inline-flex min-h-touch cursor-pointer items-center gap-2 rounded-pill border border-line-strong bg-surface px-4 has-checked:border-select-500 has-checked:bg-select-50 has-focus-visible:outline-3 has-focus-visible:outline-focus"
            >
              <input
                type="radio"
                name="label"
                className="sr-only"
                checked={v.label === l}
                onChange={() => set('label')(l)}
              />
              {LABEL[l]}
            </label>
          ))}
        </div>
      </fieldset>
      {v.label === 'other' && (
        <TextField label="Label name" maxLength={40} {...text('customLabel')} />
      )}
      <TextField label="Recipient name" required autoComplete="name" {...text('recipientName')} />
      <TextField
        label="Phone"
        required
        type="tel"
        autoComplete="tel"
        hint="Include the country code, e.g. +91 or +973."
        {...text('phone')}
      />
      <SelectField
        label="Country"
        name="countryCode"
        value={v.countryCode}
        error={errors.countryCode}
        options={COUNTRIES.map((x) => ({ value: x.code, label: x.name }))}
        onChange={(x) => set('countryCode')(x)}
      />
      <TextField
        label="Flat / house / building"
        required
        autoComplete="address-line1"
        {...text('line1')}
      />
      <TextField label="Street / road" autoComplete="address-line2" {...text('line2')} />
      <TextField
        label={v.countryCode === 'BH' ? 'Block / area' : 'Area / locality'}
        {...text('area')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="City / town" required autoComplete="address-level2" {...text('city')} />
        <TextField label={c.regionLabel} autoComplete="address-level1" {...text('region')} />
      </div>
      <TextField
        label={c.postalLabel}
        required={v.countryCode === 'IN'}
        inputMode={v.countryCode === 'IN' ? 'numeric' : undefined}
        autoComplete="postal-code"
        {...text('postalCode')}
      />
      <TextField label="Landmark" {...text('landmark')} />
      <TextField label="Delivery instructions" maxLength={300} {...text('deliveryInstructions')} />
      {!existing?.isDefault && (
        <label className="flex min-h-touch items-center gap-3">
          <input
            type="checkbox"
            className="size-5 accent-[var(--color-action-600)]"
            checked={makeDefault}
            onChange={(e) => setMakeDefault(e.target.checked)}
          />
          Make this my default address
        </label>
      )}
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm text-danger">
          Please fix the highlighted fields.
        </p>
      )}
      {failure && <ErrorState error={failure} />}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : existing ? 'Save changes' : 'Save address'}
        </Button>
        <Link
          to="/account/addresses"
          className="inline-flex min-h-touch items-center px-3 font-medium text-action-600 hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

export default function AddressFormPage() {
  const { id } = useParams()
  const repo = useAccountRepository()
  const isNew = id === undefined
  const malformed = !isNew && !UUID_RE.test(id)
  const { state, reload } = useResource(
    repo && !isNew && !malformed
      ? async () => {
          const a = (await repo.listAddresses()).find((x) => x.id === id)
          if (!a) throw new AccountError('not-found', 'Address not found')
          return a
        }
      : null,
    `address:${id}`,
  )
  return (
    <section>
      <PageTitle>{isNew ? 'Add address' : 'Edit address'}</PageTitle>
      {!repo ? (
        <Unavailable />
      ) : isNew ? (
        <AddressForm initial={emptyAddress()} existing={null} />
      ) : malformed ? (
        <ErrorState error={new AccountError('not-found', 'Address not found')} />
      ) : state.status === 'loading' ? (
        <Loading label="Loading address…" />
      ) : state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={reload} />
      ) : (
        <AddressForm initial={state.data} existing={state.data} />
      )}
    </section>
  )
}
