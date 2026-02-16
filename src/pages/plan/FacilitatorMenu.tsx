/**
 *  GroupCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Menu, MenuItem } from '@mui/material';

import { useEffect, useState } from 'react';
import { addFacilitatorsToGroup } from '../../api/addFacilitatorsToGroup';
import { facilitatorService } from '../../api/ceFacilitatorService';
import { removeFacilitatorsFromGroup } from '../../api/removeFacilitatorsFromGroup';
import { Facilitator, Group } from '../../api/types';
import AddFacilitatorModal from "../../components/AddFacilitatorModal";
import { UI_STRINGS } from "../../constants";

export const FacilitatorMenu: React.FC<{ group: Group, anchorElement: HTMLElement | null, onChange: (group: Group) => void }> = ({ group, anchorElement, onChange }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showMenu = Boolean(anchorEl);

    const [allFacilitators, setAllFacilitators] = useState<Facilitator[]>([]);
    const [availableFacilitators, setAvailableFacilitators] = useState<Facilitator[]>([]);

    const [showAddFacilitator, setShowAddFacilitator] = useState<boolean>(false);

    useEffect(() => {
        facilitatorService.getAll()
            .then(ff => setAllFacilitators(ff));
    }, []);

    useEffect(() => {
        setAnchorEl(anchorElement);
    }, [anchorElement]);

    useEffect(() => {
        if (group) {
            const current = (group.assignments ?? [])
                .map(a => a.facilitator?.id);
            setAvailableFacilitators(allFacilitators.filter(f => !current.includes(f.id)))
        }
    }, [group, allFacilitators])

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAdd = () => {
        setShowAddFacilitator(true);
        setAnchorEl(null);
    };

    const handleRemove = () => {
        if (group) {
            removeFacilitatorsFromGroup(group)
                .then((updated) => onChange(updated!))
                .finally(() => setAnchorEl(null));
        }
    };

    const handleCloseModal = () => {
        setShowAddFacilitator(false);
    }

    const handleAddFacilitator = (newFacilitators: Facilitator[]) => {
        if (group) {
            addFacilitatorsToGroup(group, newFacilitators)
                .then((updated) => {
                    setShowAddFacilitator(false);
                    onChange(updated!);
                });
        }
    }

    return (group &&
        <>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={showMenu}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <MenuItem onClick={handleAdd}>{UI_STRINGS.CHANGE_FACILITATOR}</MenuItem>
                <MenuItem onClick={handleRemove} disabled={(group.assignments ?? []).length === 0}>{UI_STRINGS.REMOVE_FACILITATOR}</MenuItem>
            </Menu>
            <AddFacilitatorModal
                facilitators={availableFacilitators}
                isOpen={showAddFacilitator}
                onClose={handleCloseModal}
                onSubmit={handleAddFacilitator} />
        </>
    );
}
