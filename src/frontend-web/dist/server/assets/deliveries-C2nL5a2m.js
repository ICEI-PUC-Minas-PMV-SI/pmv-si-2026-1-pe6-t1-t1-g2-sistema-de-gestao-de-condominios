import { d as apiRequest, f as Modal, i as getAuthUser, m as Button, r as getAuthToken, t as clearAuthSession } from "./auth-service-C_vZ-nsD.js";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, X } from "lucide-react";
//#region src/features/deliveries/constants.ts
var DEFAULT_DELIVERY_STATUS = "Disponível para Retirada";
var DELIVERY_STATUS_OPTIONS = [DEFAULT_DELIVERY_STATUS, "Entregue"];
var EMPTY_DELIVERY_FORM = {
	recipientUserId: "",
	description: "",
	status: DEFAULT_DELIVERY_STATUS
};
var EMPTY_FILTER_FORM = {
	status: "",
	arrivalDateFrom: "",
	arrivalDateTo: "",
	recipient: ""
};
//#endregion
//#region src/features/deliveries/utils/delivery-formatters.ts
function getProfileLabel(profile) {
	const normalizedProfile = profile?.toLowerCase();
	if (normalizedProfile === "administrador") return "Administrador";
	if (normalizedProfile === "morador") return "Morador";
	return "Perfil";
}
function getAvatarUrl(name, profile) {
	const background = profile?.toLowerCase() === "administrador" ? "2f4f8f" : "2f6a4a";
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff&bold=true`;
}
function isToday(dateValue) {
	if (!dateValue) return false;
	const date = new Date(dateValue);
	const today = /* @__PURE__ */ new Date();
	return date.toDateString() === today.toDateString();
}
function isWaitingPickup(status) {
	const normalizedStatus = status?.toLowerCase() ?? "";
	return normalizedStatus.includes("disponível") || normalizedStatus.includes("disponivel") || normalizedStatus.includes("retirada");
}
function isPickedUp(delivery) {
	const normalizedStatus = delivery.status?.toLowerCase() ?? "";
	return Boolean(delivery.pickup_date) || normalizedStatus.includes("entregue") || normalizedStatus.includes("retirad");
}
function formatDateTime(dateValue) {
	if (!dateValue) return "-";
	return new Date(dateValue).toLocaleString("pt-BR");
}
function getUserLabel(user, fallbackId) {
	return user?.username || user?.email || (fallbackId ? `ID ${fallbackId}` : "-");
}
function getDeliveryUserLabel(username, email, fallbackId) {
	return username || email || (fallbackId ? `ID ${fallbackId}` : "-");
}
function getStatusClasses(status) {
	if (isWaitingPickup(status)) return "bg-amber-50 text-amber-600";
	if ((status ?? "").toLowerCase().includes("entreg")) return "bg-emerald-50 text-emerald-600";
	return "bg-slate-100 text-slate-600";
}
//#endregion
//#region src/features/deliveries/components/CreateDeliveryModal.tsx
function CreateDeliveryModal({ errorMessage, form, isPending, onChange, onClose, onSubmit, open, users }) {
	return /* @__PURE__ */ jsx(Modal, {
		open,
		onClose,
		title: "Nova Encomenda",
		children: /* @__PURE__ */ jsxs("form", {
			className: "flex flex-col gap-4 w-full",
			onSubmit,
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ jsx("label", {
						className: "text-sm font-semibold text-on-surface",
						htmlFor: "recipientUserId",
						children: "Destinatário"
					}), users.length ? /* @__PURE__ */ jsxs("select", {
						className: "rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant",
						id: "recipientUserId",
						name: "recipientUserId",
						onChange,
						value: form.recipientUserId,
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "Sem destinatário vinculado"
						}), users.map((user) => /* @__PURE__ */ jsx("option", {
							value: user.id,
							children: getUserLabel(user, user.id)
						}, user.id))]
					}) : /* @__PURE__ */ jsx("input", {
						className: "rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant",
						id: "recipientUserId",
						min: "1",
						name: "recipientUserId",
						onChange,
						placeholder: "ID do destinatário",
						type: "number",
						value: form.recipientUserId
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ jsx("label", {
						className: "text-sm font-semibold text-on-surface",
						htmlFor: "description",
						children: "Descrição"
					}), /* @__PURE__ */ jsx("textarea", {
						className: "rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant",
						id: "description",
						name: "description",
						onChange,
						placeholder: "Descrição registrada para esta encomenda",
						required: true,
						rows: 3,
						value: form.description
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ jsx("label", {
						className: "text-sm font-semibold text-on-surface",
						htmlFor: "status",
						children: "Status"
					}), /* @__PURE__ */ jsx("select", {
						className: "rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant",
						id: "status",
						name: "status",
						onChange,
						value: form.status,
						children: DELIVERY_STATUS_OPTIONS.map((status) => /* @__PURE__ */ jsx("option", {
							value: status,
							children: status
						}, status))
					})]
				}),
				errorMessage && /* @__PURE__ */ jsx("div", {
					className: "text-error text-sm",
					children: errorMessage
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex gap-3 mt-2 justify-end",
					children: [/* @__PURE__ */ jsx(Button, {
						color: "primary",
						size: "md",
						type: "submit",
						disabled: isPending,
						children: isPending ? "Registrando..." : "Registrar Encomenda"
					}), /* @__PURE__ */ jsx(Button, {
						color: "secondary",
						size: "md",
						type: "button",
						onClick: onClose,
						children: "Cancelar"
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/features/deliveries/components/MaterialIcon.tsx
function MaterialIcon({ name, className = "" }) {
	return /* @__PURE__ */ jsx("span", {
		className: `material-symbols-outlined ${className}`,
		children: name
	});
}
//#endregion
//#region src/features/deliveries/components/DeliveriesTable.tsx
function DeliveriesTable({ activeFilters, deletePending, deliveries, errorMessage, filteredDeliveries, isLoading, onClearFilters, onDeleteDelivery, onOpenFilterModal, onOpenReportModal, onRemoveFilter, showUsersWarning }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-cardxl shadow-soft border border-surface-container overflow-hidden bg-surface-container-lowest",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between border-b border-surface-container p-lg",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "font-bold text-on-surface",
					children: "Entregas Recentes"
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsxs(Button, {
						color: "secondary",
						size: "md",
						onClick: onOpenFilterModal,
						children: ["Filtros", activeFilters.length > 0 && /* @__PURE__ */ jsx("span", {
							className: "ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold",
							children: activeFilters.length
						})]
					}), /* @__PURE__ */ jsx(Button, {
						color: "secondary",
						size: "md",
						onClick: onOpenReportModal,
						children: "Relatório"
					})]
				})]
			}),
			activeFilters.length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap gap-2 items-center border-b border-surface-container p-md",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-semibold uppercase tracking-wider mr-1 text-on-surface-variant",
						children: "Filtros ativos:"
					}),
					activeFilters.map((filter) => /* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary-fixed text-primary",
						children: [filter.label, /* @__PURE__ */ jsx("button", {
							"aria-label": `Remover filtro ${filter.label}`,
							className: "text-primary opacity-60 transition-colors duration-180",
							onClick: () => onRemoveFilter(filter.id),
							type: "button",
							children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
						})]
					}, filter.id)),
					/* @__PURE__ */ jsx("button", {
						className: "text-[11px] underline underline-offset-2 ml-1 text-on-surface-variant transition-colors duration-180",
						onClick: onClearFilters,
						type: "button",
						children: "Limpar todos"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[10px] uppercase tracking-[0.1em] text-on-surface-variant bg-surface-container",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "px-8 py-4 font-bold",
								children: "Destinatário"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-8 py-4 font-bold",
								children: "Registrado por"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-8 py-4 font-bold",
								children: "Descrição"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-8 py-4 font-bold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-8 py-4 font-bold",
								children: "Data de Recebimento"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-8 py-4 font-bold",
								children: "Data de Retirada"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-8 py-4 font-bold text-right",
								children: "Ações"
							})
						]
					}) }), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-surface-container",
						children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 7,
							className: "text-center py-8 text-on-surface-variant",
							children: "Carregando..."
						}) }) : errorMessage ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 7,
							className: "text-center py-8 text-error",
							children: errorMessage
						}) }) : filteredDeliveries.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 7,
							className: "text-center py-8 text-on-surface-variant",
							children: "Nenhuma encomenda encontrada."
						}) }) : filteredDeliveries.map((delivery) => /* @__PURE__ */ jsxs("tr", {
							className: "group hover:bg-surface-container-low transition-colors",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "px-8 py-5",
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant overflow-hidden",
											children: /* @__PURE__ */ jsx(MaterialIcon, { name: "person" })
										}), /* @__PURE__ */ jsx("span", {
											className: "font-bold text-on-surface text-sm",
											children: getUserLabel({
												username: delivery.recipient_username,
												email: delivery.recipient_email
											}, delivery.recipient_user_id)
										})]
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-8 py-5",
									children: /* @__PURE__ */ jsx("span", {
										className: "text-sm text-on-surface-variant font-medium",
										children: getUserLabel({
											username: delivery.registered_by_username,
											email: delivery.registered_by_email
										}, delivery.registered_by_user_id)
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-8 py-5",
									children: /* @__PURE__ */ jsx("span", {
										className: "line-clamp-2 text-sm text-on-surface-variant",
										children: delivery.description || "-"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-8 py-5",
									children: /* @__PURE__ */ jsxs("span", {
										className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(delivery.status)}`,
										children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-current rounded-full" }), delivery.status ?? "-"]
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-8 py-5 text-sm text-on-surface-variant font-medium",
									children: formatDateTime(delivery.arrival_date)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-8 py-5 text-sm text-on-surface-variant font-medium",
									children: formatDateTime(delivery.pickup_date)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-8 py-5 text-right",
									children: /* @__PURE__ */ jsx("div", {
										className: "flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
										children: /* @__PURE__ */ jsx("button", {
											className: "p-2 text-on-surface-variant hover:text-error transition-colors disabled:opacity-50",
											disabled: deletePending,
											onClick: () => onDeleteDelivery(delivery.id),
											type: "button",
											children: /* @__PURE__ */ jsx(MaterialIcon, {
												name: "delete",
												className: "text-xl"
											})
										})
									})
								})
							]
						}, delivery.id))
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "p-6 bg-surface-container border-t border-surface-container flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "text-xs text-on-surface-variant font-medium",
					children: [
						"Mostrando ",
						filteredDeliveries.length,
						" de ",
						deliveries.length,
						" ",
						"encomendas"
					]
				}), showUsersWarning && /* @__PURE__ */ jsx("p", {
					className: "text-xs text-amber-600 font-medium",
					children: "Nomes de usuários indisponíveis para este perfil."
				})]
			})
		]
	});
}
//#endregion
//#region src/features/deliveries/components/DeliveryPageHeader.tsx
function DeliveryPageHeader({ onCreateClick }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex justify-between items-end",
		children: [/* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsx("span", {
				className: "bg-surface-container-high text-primary font-label-sm text-xs px-3 py-1 rounded-full tracking-wider",
				children: "LOGÍSTICA INTERNA"
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "text-headline-md font-headline-md text-slate-900 mt-2",
				children: "Gestão de Encomendas"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-slate-500 font-body-md text-sm mt-1",
				children: "Monitore e gerencie o fluxo de pacotes do condomínio."
			})
		] }), /* @__PURE__ */ jsx(Button, {
			color: "primary",
			size: "md",
			onClick: onCreateClick,
			children: "Nova Encomenda"
		})]
	});
}
//#endregion
//#region src/features/deliveries/components/DeliverySidebar.tsx
var navItems = [
	{
		icon: "dashboard",
		label: "Dashboard",
		active: false
	},
	{
		icon: "group",
		label: "Residents",
		active: false
	},
	{
		icon: "package_2",
		label: "Deliveries",
		active: true
	},
	{
		icon: "build",
		label: "Maintenance",
		active: false
	},
	{
		icon: "settings",
		label: "Settings",
		active: false
	}
];
function DeliverySidebar({ authUser, avatarUrl, displayName, onLogout, profileLabel }) {
	return /* @__PURE__ */ jsx("aside", {
		className: "h-screen w-64 fixed left-0 top-0 text-sm font-medium z-50 flex flex-col bg-surface-container-lowest shadow-card border-r border-outline-variant rounded-tr-card rounded-br-card",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-y-4 p-6 h-full",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "mb-8",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary shadow-card",
							children: /* @__PURE__ */ jsx(MaterialIcon, { name: "package_2" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
							className: "text-lg font-extrabold tracking-tight text-on-surface",
							children: "Admin Portal"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-on-surface-variant",
							children: "Grand Residences"
						})] })]
					})
				}),
				/* @__PURE__ */ jsx("nav", {
					className: "space-y-1",
					children: navItems.map((item) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: `flex w-full items-center gap-3 rounded-lg py-2 px-4 transition-all duration-200 ease-in-out ${item.active ? "text-primary bg-surface shadow-card border-l-4 border-primary" : "text-on-surface-variant bg-transparent"}`,
						children: [/* @__PURE__ */ jsx(MaterialIcon, { name: item.icon }), /* @__PURE__ */ jsx("span", { children: item.label })]
					}, item.label))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-auto pt-6 border-t border-outline-variant",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 px-2",
						children: [
							/* @__PURE__ */ jsx("img", {
								alt: `Perfil de ${displayName}`,
								className: "w-8 h-8 rounded-full object-cover",
								src: avatarUrl
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1 overflow-hidden",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-xs font-bold truncate text-on-surface",
									children: displayName
								}), /* @__PURE__ */ jsx("span", {
									className: `mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight ${authUser?.profile?.toLowerCase() === "administrador" ? "bg-primary-fixed text-primary" : "bg-tertiary-fixed text-tertiary"}`,
									children: profileLabel
								})]
							}),
							/* @__PURE__ */ jsx(Button, {
								"aria-label": "Sair da aplicação",
								className: "h-9 w-9 shrink-0 rounded-full hover:bg-surface-container-low",
								color: "transparent",
								onClick: onLogout,
								size: "icon",
								title: "Sair",
								type: "button",
								children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" })
							})
						]
					})
				})
			]
		})
	});
}
//#endregion
//#region src/features/deliveries/components/DeliveryStatsGrid.tsx
var cards = [
	{
		key: "receivedToday",
		icon: "inventory_2",
		iconClassName: "bg-primary-fixed text-primary",
		label: "Total Recebido (Hoje)"
	},
	{
		key: "waitingPickup",
		icon: "pending_actions",
		iconClassName: "bg-secondary-fixed text-secondary",
		label: "Aguardando Retirada"
	},
	{
		key: "pickedUpToday",
		icon: "check_circle",
		iconClassName: "bg-tertiary-fixed text-tertiary",
		label: "Retiradas (Hoje)"
	}
];
function DeliveryStatsGrid({ totalDeliveries, stats }) {
	const storagePercent = totalDeliveries ? stats.inStorage / totalDeliveries * 100 : 0;
	return /* @__PURE__ */ jsxs("div", {
		className: "grid grid-cols-1 md:grid-cols-4 gap-6",
		children: [cards.map((card) => /* @__PURE__ */ jsxs("div", {
			className: "p-6 rounded-card shadow-soft border border-surface-container bg-surface-container-lowest",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex items-center justify-between mb-4",
					children: /* @__PURE__ */ jsx("div", {
						className: `w-10 h-10 rounded-full flex items-center justify-center ${card.iconClassName}`,
						children: /* @__PURE__ */ jsx(MaterialIcon, { name: card.icon })
					})
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs font-medium text-on-surface-variant",
					children: card.label
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-2xl font-extrabold text-on-surface",
					children: stats[card.key]
				})
			]
		}, card.key)), /* @__PURE__ */ jsxs("div", {
			className: "p-6 rounded-card shadow-xl relative overflow-hidden bg-primary text-on-primary",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative z-10",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-medium opacity-80 text-primary-fixed",
						children: "Encomendas no Depósito"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-2xl font-extrabold mt-1",
						children: stats.inStorage
					}),
					/* @__PURE__ */ jsx("div", {
						className: "w-full bg-white/20 h-1.5 rounded-full mt-4",
						children: /* @__PURE__ */ jsx("div", {
							className: "bg-white h-full rounded-full",
							style: { width: `${storagePercent}%` }
						})
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "absolute -right-4 -bottom-4 opacity-10",
				children: /* @__PURE__ */ jsx(MaterialIcon, {
					name: "warehouse",
					className: "text-8xl"
				})
			})]
		})]
	});
}
//#endregion
//#region src/features/deliveries/components/DeliveryTopbar.tsx
function DeliveryTopbar({ onSearchTermChange, searchTerm }) {
	return /* @__PURE__ */ jsxs("header", {
		className: "flex justify-between items-center px-6 py-3 sticky top-0 z-40 bg-white/90 backdrop-blur-md font-manrope text-sm antialiased shadow-sm border-b border-slate-100 ml-64 w-[calc(100%-16rem)]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center bg-slate-50 rounded-full px-4 py-1.5 w-96 border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-primary/20",
			children: [/* @__PURE__ */ jsx(MaterialIcon, {
				name: "search",
				className: "text-slate-400 text-sm mr-2"
			}), /* @__PURE__ */ jsx("input", {
				className: "bg-transparent border-none text-xs focus:ring-0 w-full text-slate-600 placeholder:text-slate-400",
				onChange: (event) => onSearchTermChange(event.target.value),
				placeholder: "Filtrar por morador, descrição ou status...",
				type: "text",
				value: searchTerm
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-4",
			children: [/* @__PURE__ */ jsxs("button", {
				className: "w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative",
				type: "button",
				children: [/* @__PURE__ */ jsx(MaterialIcon, { name: "notifications" }), /* @__PURE__ */ jsx("span", { className: "absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-white" })]
			}), /* @__PURE__ */ jsx("button", {
				className: "w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full transition-colors",
				type: "button",
				children: /* @__PURE__ */ jsx(MaterialIcon, { name: "account_circle" })
			})]
		})]
	});
}
//#endregion
//#region src/features/deliveries/components/FilterModal.tsx
function FilterModal({ filterForm, onApply, onChange, onClose, open }) {
	function updateField(field) {
		return (event) => {
			onChange({
				...filterForm,
				[field]: event.target.value
			});
		};
	}
	return /* @__PURE__ */ jsx(Modal, {
		open,
		onClose,
		title: "Filtros",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-4 w-full",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ jsx("label", {
						className: "text-sm font-semibold text-on-surface",
						htmlFor: "filter-status",
						children: "Status"
					}), /* @__PURE__ */ jsxs("select", {
						className: "rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant",
						id: "filter-status",
						onChange: updateField("status"),
						value: filterForm.status,
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "Todos"
						}), DELIVERY_STATUS_OPTIONS.map((status) => /* @__PURE__ */ jsx("option", {
							value: status,
							children: status
						}, status))]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ jsx("label", {
						className: "text-sm font-semibold text-on-surface",
						htmlFor: "filter-arrival-from",
						children: "Data de chegada - de"
					}), /* @__PURE__ */ jsx("input", {
						className: "rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant",
						id: "filter-arrival-from",
						onChange: updateField("arrivalDateFrom"),
						type: "date",
						value: filterForm.arrivalDateFrom
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ jsx("label", {
						className: "text-sm font-semibold text-on-surface",
						htmlFor: "filter-arrival-to",
						children: "Data de chegada - até"
					}), /* @__PURE__ */ jsx("input", {
						className: "rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant",
						id: "filter-arrival-to",
						onChange: updateField("arrivalDateTo"),
						type: "date",
						value: filterForm.arrivalDateTo
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ jsx("label", {
						className: "text-sm font-semibold text-on-surface",
						htmlFor: "filter-recipient",
						children: "Destinatário"
					}), /* @__PURE__ */ jsx("input", {
						className: "rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant",
						id: "filter-recipient",
						onChange: updateField("recipient"),
						placeholder: "Nome ou e-mail",
						type: "text",
						value: filterForm.recipient
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex gap-3 mt-2 justify-end",
					children: [/* @__PURE__ */ jsx(Button, {
						color: "primary",
						size: "md",
						type: "button",
						onClick: onApply,
						children: "Aplicar filtros"
					}), /* @__PURE__ */ jsx(Button, {
						color: "secondary",
						size: "md",
						type: "button",
						onClick: onClose,
						children: "Cancelar"
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/features/deliveries/components/ReportModal.tsx
function ReportModal({ deliveries, onClose, open, stats }) {
	const statusDistribution = Array.from(deliveries.reduce((accumulator, delivery) => {
		const status = delivery.status ?? "Sem status";
		accumulator.set(status, (accumulator.get(status) ?? 0) + 1);
		return accumulator;
	}, /* @__PURE__ */ new Map()));
	return /* @__PURE__ */ jsxs(Modal, {
		open,
		onClose,
		title: "Relatório de Encomendas",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					{
						label: "Total",
						value: deliveries.length
					},
					{
						label: "Recebidas hoje",
						value: stats.receivedToday
					},
					{
						label: "Aguardando retirada",
						value: stats.waitingPickup
					},
					{
						label: "No depósito",
						value: stats.inStorage
					}
				].map(({ label, value }) => /* @__PURE__ */ jsxs("div", {
					className: "rounded-xl bg-slate-50 border border-slate-100 px-4 py-3",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[11px] text-slate-500 font-medium uppercase tracking-wide",
						children: label
					}), /* @__PURE__ */ jsx("p", {
						className: "text-2xl font-extrabold text-slate-900 mt-0.5",
						children: value
					})]
				}, label))
			}),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2",
				children: "Por status"
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-1.5",
				children: [statusDistribution.map(([status, count]) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm",
					children: [/* @__PURE__ */ jsxs("span", {
						className: `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusClasses(status)}`,
						children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-current rounded-full" }), status]
					}), /* @__PURE__ */ jsx("span", {
						className: "font-bold text-slate-700",
						children: count
					})]
				}, status)), deliveries.length === 0 && /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-400 text-center py-2",
					children: "Nenhuma encomenda registrada."
				})]
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2",
				children: "Últimas encomendas"
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1",
				children: [deliveries.slice(0, 20).map((delivery) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col min-w-0",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-semibold text-slate-800 truncate",
							children: delivery.description || `Encomenda #${delivery.id}`
						}), /* @__PURE__ */ jsxs("span", {
							className: "text-slate-400 truncate",
							children: [
								delivery.recipient_username ?? delivery.recipient_email ?? "Sem destinatário",
								" ",
								"· ",
								formatDateTime(delivery.arrival_date)
							]
						})]
					}), /* @__PURE__ */ jsx("span", {
						className: `ml-3 shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusClasses(delivery.status)}`,
						children: delivery.status ?? "-"
					})]
				}, delivery.id)), deliveries.length === 0 && /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-400 text-center py-2",
					children: "Nenhuma encomenda registrada."
				})]
			})] }),
			/* @__PURE__ */ jsx("div", {
				className: "flex justify-end pt-1",
				children: /* @__PURE__ */ jsx(Button, {
					color: "secondary",
					size: "md",
					onClick: onClose,
					children: "Fechar"
				})
			})
		]
	});
}
//#endregion
//#region src/features/deliveries/services/deliveries-service.ts
function getAuthHeaders() {
	const token = getAuthToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}
function fetchDeliveries() {
	return apiRequest("/api/Deliveries", { headers: getAuthHeaders() });
}
function fetchDeliveryUsers() {
	return apiRequest("/api/Users", { headers: getAuthHeaders() });
}
function createDelivery(payload) {
	return apiRequest("/api/Deliveries", {
		method: "POST",
		headers: getAuthHeaders(),
		body: JSON.stringify(payload)
	});
}
function deleteDelivery(id) {
	return apiRequest(`/api/Deliveries/${id}`, {
		method: "DELETE",
		headers: getAuthHeaders()
	});
}
//#endregion
//#region src/features/deliveries/utils/delivery-filters.ts
function filterDeliveries(deliveries, searchTerm, activeFilters) {
	let result = deliveries;
	const normalizedSearchTerm = searchTerm.trim().toLowerCase();
	if (normalizedSearchTerm) result = result.filter((delivery) => {
		return [
			delivery.id,
			delivery.description,
			delivery.status,
			getDeliveryUserLabel(delivery.recipient_username, delivery.recipient_email, delivery.recipient_user_id),
			getDeliveryUserLabel(delivery.registered_by_username, delivery.registered_by_email, delivery.registered_by_user_id)
		].filter(Boolean).join(" ").toLowerCase().includes(normalizedSearchTerm);
	});
	for (const filter of activeFilters) {
		if (filter.field === "status") result = result.filter((delivery) => delivery.status === filter.value);
		if (filter.field === "arrival_date_from") result = result.filter((delivery) => delivery.arrival_date >= filter.value);
		if (filter.field === "arrival_date_to") result = result.filter((delivery) => delivery.arrival_date <= `${filter.value}T23:59:59`);
		if (filter.field === "recipient") {
			const value = filter.value.toLowerCase();
			result = result.filter((delivery) => (delivery.recipient_username ?? "").toLowerCase().includes(value) || (delivery.recipient_email ?? "").toLowerCase().includes(value));
		}
	}
	return result;
}
function getFilterFormFromActiveFilters(activeFilters) {
	const filterForm = { ...EMPTY_FILTER_FORM };
	for (const filter of activeFilters) {
		if (filter.field === "status") filterForm.status = filter.value;
		if (filter.field === "arrival_date_from") filterForm.arrivalDateFrom = filter.value;
		if (filter.field === "arrival_date_to") filterForm.arrivalDateTo = filter.value;
		if (filter.field === "recipient") filterForm.recipient = filter.value;
	}
	return filterForm;
}
function buildActiveFilters(filterForm) {
	const nextFilters = [];
	if (filterForm.status) nextFilters.push({
		id: "status",
		label: `Status: ${filterForm.status}`,
		field: "status",
		value: filterForm.status
	});
	if (filterForm.arrivalDateFrom) nextFilters.push({
		id: "arrival_date_from",
		label: `A partir de: ${filterForm.arrivalDateFrom}`,
		field: "arrival_date_from",
		value: filterForm.arrivalDateFrom
	});
	if (filterForm.arrivalDateTo) nextFilters.push({
		id: "arrival_date_to",
		label: `Até: ${filterForm.arrivalDateTo}`,
		field: "arrival_date_to",
		value: filterForm.arrivalDateTo
	});
	const recipient = filterForm.recipient.trim();
	if (recipient) nextFilters.push({
		id: "recipient",
		label: `Destinatário: ${recipient}`,
		field: "recipient",
		value: recipient
	});
	return nextFilters;
}
//#endregion
//#region src/features/deliveries/utils/delivery-stats.ts
function calculateDeliveryStats(deliveries) {
	return {
		receivedToday: deliveries.filter((delivery) => isToday(delivery.arrival_date)).length,
		waitingPickup: deliveries.filter((delivery) => !delivery.pickup_date && isWaitingPickup(delivery.status)).length,
		pickedUpToday: deliveries.filter((delivery) => isPickedUp(delivery) && isToday(delivery.pickup_date)).length,
		inStorage: deliveries.filter((delivery) => !delivery.pickup_date).length
	};
}
//#endregion
//#region src/features/deliveries/hooks/useDeliveriesPage.ts
function useDeliveriesPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const authToken = getAuthToken();
	const [authUser, setAuthUser] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [reportModalOpen, setReportModalOpen] = useState(false);
	const [filterModalOpen, setFilterModalOpen] = useState(false);
	const [filterForm, setFilterForm] = useState(EMPTY_FILTER_FORM);
	const [activeFilters, setActiveFilters] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [form, setForm] = useState(EMPTY_DELIVERY_FORM);
	useEffect(() => {
		setAuthUser(getAuthUser());
	}, []);
	const displayName = authUser?.username || authUser?.email || "Usuário";
	const profileLabel = getProfileLabel(authUser?.profile);
	const avatarUrl = getAvatarUrl(displayName, authUser?.profile);
	const deliveriesQuery = useQuery({
		queryKey: ["deliveries"],
		queryFn: fetchDeliveries,
		enabled: Boolean(authToken)
	});
	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: fetchDeliveryUsers,
		enabled: Boolean(authToken),
		retry: false
	});
	const deliveries = deliveriesQuery.data ?? [];
	const filteredDeliveries = useMemo(() => filterDeliveries(deliveries, searchTerm, activeFilters), [
		deliveries,
		searchTerm,
		activeFilters
	]);
	const stats = useMemo(() => calculateDeliveryStats(deliveries), [deliveries]);
	const createDeliveryMutation = useMutation({
		mutationFn: () => createDelivery({
			recipient_user_id: form.recipientUserId ? Number(form.recipientUserId) : null,
			registered_by_user_id: authUser?.id ?? null,
			description: form.description.trim(),
			arrival_date: (/* @__PURE__ */ new Date()).toISOString(),
			pickup_date: null,
			status: form.status
		}),
		onSuccess: () => {
			setModalOpen(false);
			setForm(EMPTY_DELIVERY_FORM);
			queryClient.invalidateQueries({ queryKey: ["deliveries"] });
		}
	});
	const deleteDeliveryMutation = useMutation({
		mutationFn: deleteDelivery,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveries"] });
		}
	});
	function handleLogout() {
		clearAuthSession();
		navigate({
			to: "/login",
			replace: true
		});
	}
	function handleFormChange(event) {
		setForm((currentForm) => ({
			...currentForm,
			[event.target.name]: event.target.value
		}));
	}
	function handleSubmitDelivery(event) {
		event.preventDefault();
		createDeliveryMutation.mutate();
	}
	function openFilterModal() {
		setFilterForm(getFilterFormFromActiveFilters(activeFilters));
		setFilterModalOpen(true);
	}
	function applyFilters() {
		setActiveFilters(buildActiveFilters(filterForm));
		setFilterModalOpen(false);
	}
	function removeFilter(id) {
		setActiveFilters((currentFilters) => currentFilters.filter((filter) => filter.id !== id));
	}
	function handleDeleteDelivery(id) {
		if (window.confirm("Remover esta encomenda?")) deleteDeliveryMutation.mutate(id);
	}
	return {
		activeFilters,
		applyFilters,
		authUser,
		avatarUrl,
		createDeliveryMutation,
		deleteDeliveryMutation,
		deliveries,
		deliveriesQuery,
		displayName,
		filterForm,
		filterModalOpen,
		filteredDeliveries,
		form,
		handleDeleteDelivery,
		handleFormChange,
		handleLogout,
		handleSubmitDelivery,
		modalOpen,
		openFilterModal,
		profileLabel,
		removeFilter,
		reportModalOpen,
		searchTerm,
		setActiveFilters,
		setFilterForm,
		setFilterModalOpen,
		setModalOpen,
		setReportModalOpen,
		setSearchTerm,
		stats,
		usersQuery
	};
}
//#endregion
//#region src/features/deliveries/DeliveriesPage.tsx
function DeliveriesPage() {
	const page = useDeliveriesPage();
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-background text-on-background min-h-screen font-sans",
		children: [
			/* @__PURE__ */ jsx(DeliverySidebar, {
				authUser: page.authUser,
				avatarUrl: page.avatarUrl,
				displayName: page.displayName,
				onLogout: page.handleLogout,
				profileLabel: page.profileLabel
			}),
			/* @__PURE__ */ jsx(DeliveryTopbar, {
				onSearchTermChange: page.setSearchTerm,
				searchTerm: page.searchTerm
			}),
			/* @__PURE__ */ jsx("main", {
				className: "ml-64 p-8 min-h-screen",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-7xl mx-auto space-y-8",
					children: [
						/* @__PURE__ */ jsx(DeliveryPageHeader, { onCreateClick: () => page.setModalOpen(true) }),
						/* @__PURE__ */ jsx(CreateDeliveryModal, {
							errorMessage: page.createDeliveryMutation.error?.message,
							form: page.form,
							isPending: page.createDeliveryMutation.isPending,
							onChange: page.handleFormChange,
							onClose: () => page.setModalOpen(false),
							onSubmit: page.handleSubmitDelivery,
							open: page.modalOpen,
							users: page.usersQuery.data ?? []
						}),
						/* @__PURE__ */ jsx(ReportModal, {
							deliveries: page.deliveries,
							onClose: () => page.setReportModalOpen(false),
							open: page.reportModalOpen,
							stats: page.stats
						}),
						/* @__PURE__ */ jsx(FilterModal, {
							filterForm: page.filterForm,
							onApply: page.applyFilters,
							onChange: page.setFilterForm,
							onClose: () => page.setFilterModalOpen(false),
							open: page.filterModalOpen
						}),
						/* @__PURE__ */ jsx(DeliveryStatsGrid, {
							stats: page.stats,
							totalDeliveries: page.deliveries.length
						}),
						/* @__PURE__ */ jsx(DeliveriesTable, {
							activeFilters: page.activeFilters,
							deletePending: page.deleteDeliveryMutation.isPending,
							deliveries: page.deliveries,
							errorMessage: page.deliveriesQuery.error?.message,
							filteredDeliveries: page.filteredDeliveries,
							isLoading: page.deliveriesQuery.isLoading,
							onClearFilters: () => page.setActiveFilters([]),
							onDeleteDelivery: page.handleDeleteDelivery,
							onOpenFilterModal: page.openFilterModal,
							onOpenReportModal: () => page.setReportModalOpen(true),
							onRemoveFilter: page.removeFilter,
							showUsersWarning: Boolean(page.usersQuery.error)
						}),
						/* @__PURE__ */ jsx("div", {
							className: "fixed bottom-0 right-0 -z-10 w-96 h-96 opacity-30",
							children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-primary-fixed to-surface-dim blur-3xl rounded-full translate-x-1/2 translate-y-1/2" })
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/routes/deliveries.tsx?tsr-split=component
var SplitComponent = DeliveriesPage;
//#endregion
export { SplitComponent as component };
