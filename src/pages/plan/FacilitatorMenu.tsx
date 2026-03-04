/**
 *  GroupCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Menu, MenuItem } from '@mui/material';

import { useEffect, useState } from 'react';
import { addFacilitatorsToGroup } from '../../api/addFacilitatorsToGroup';
import { removeFacilitatorsFromGroup } from '../../api/removeFacilitatorsFromGroup';
import { Facilitator, Group } from '../../api/types';
import AddFacilitatorModal from "../../components/AddFacilitatorModal";
import { UI_STRINGS } from "../../constants";
import { CEFacilitatorService } from '../../api/ceFacilitatorService';

export interface FacilitatorMenuProps {
    group: Group,
    anchorElement: HTMLElement | null,
    onChange: (group: Group | null) => void
}

export const FacilitatorMenu: React.FC<FacilitatorMenuProps> = ({ group, anchorElement, onChange }) => {

    const facilitatorService = CEFacilitatorService.getInstance();
    const [allFacilitators, setAllFacilitators] = useState<Facilitator[]>([]);
    const [availableFacilitators, setAvailableFacilitators] = useState<Facilitator[]>([]);

    const [showAddFacilitator, setShowAddFacilitator] = useState<boolean>(false);

    const showMenu = Boolean(anchorElement);

    useEffect(() => {
        facilitatorService.getAll()
            .then(ff => setAllFacilitators(ff));
    }, []);

    useEffect(() => {
        if (group) {
            const current = (group.assignments ?? [])
                .map(a => a.facilitator?.id);
            setAvailableFacilitators(allFacilitators.filter(f => !current.includes(f.id)))
        }
    }, [group, allFacilitators])

    const handleClose = () => {
        onChange(null);
    };

    const handleAddMenuChoice = () => {
        setShowAddFacilitator(true);
    };

    const handleRemoveMenuChoice = () => {
        if (group) {
            removeFacilitatorsFromGroup(group)
                .then((updated) => onChange(updated!));
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
        } else {
            console.error('No group in context.')
        }
    }

    return (group &&
        <>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorElement}
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
                <MenuItem onClick={handleAddMenuChoice}>{UI_STRINGS.CHANGE_FACILITATOR}</MenuItem>
                <MenuItem onClick={handleRemoveMenuChoice} disabled={(group.assignments ?? []).length === 0}>{UI_STRINGS.REMOVE_FACILITATOR}</MenuItem>
            </Menu>
            <AddFacilitatorModal
                facilitators={availableFacilitators}
                isOpen={showAddFacilitator}
                onClose={handleCloseModal}
                onSubmit={handleAddFacilitator} />
        </>
    );
}
